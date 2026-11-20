#!/usr/bin/env bash
# One-time HTTPS setup on the server. Run from anywhere inside the repo, after:
#   - DNS A records for DOMAIN and www.DOMAIN point at this server
#   - ports 80 and 443 are open in the EC2 security group
#   - the stack is built and the database is migrated (see docs/deployment-docker.md)
#
#   bash infra/scripts/init-ssl.sh              real certificate
#   STAGING=1 bash infra/scripts/init-ssl.sh    Let's Encrypt test certificate: no rate limits, browsers warn
#   FORCE=1 bash infra/scripts/init-ssl.sh      request again even if a certificate exists
#
# Nginx needs a certificate file before it can start, and Let's Encrypt needs Nginx running to prove the
# domain is yours. So: make a throwaway certificate, start Nginx, swap in the real one, reload.
set -euo pipefail
cd "$(dirname "$0")/../.."

[ -f .env ] || { echo ".env not found. Run: cp .env.example .env  and fill it in." >&2; exit 1; }
envval() { grep -E "^$1=" .env | tail -1 | cut -d= -f2- | tr -d '\r"'"'"; }

DOMAIN="$(envval DOMAIN)"
EMAIL="$(envval LETSENCRYPT_EMAIL)"
[ -n "$DOMAIN" ] || { echo "DOMAIN is empty in .env" >&2; exit 1; }
[ -n "$EMAIL" ] || { echo "LETSENCRYPT_EMAIL is empty in .env" >&2; exit 1; }
[ "$(envval NGINX_CONF)" != "prod-http" ] || { echo "NGINX_CONF is prod-http in .env. Set it to prod-https first." >&2; exit 1; }

DC="docker compose -f docker-compose.prod.yml"
LIVE="/etc/letsencrypt/live/$DOMAIN"

make_dummy() {
  $DC run --rm --no-deps --entrypoint sh certbot -c "mkdir -p $LIVE && openssl req -x509 -nodes -newkey rsa:2048 -days 1 -keyout $LIVE/privkey.pem -out $LIVE/fullchain.pem -subj '/CN=localhost'" >/dev/null 2>&1
}

if [ "${FORCE:-0}" != 1 ] && $DC run --rm --no-deps --entrypoint sh certbot -c "test -f /etc/letsencrypt/renewal/$DOMAIN.conf" >/dev/null 2>&1; then
  echo "A certificate for $DOMAIN already exists. It renews itself. Use FORCE=1 to request a new one."
  exit 0
fi

echo "1/4 Creating a temporary certificate so Nginx can start..."
make_dummy

echo "2/4 Starting Nginx..."
$DC up -d nginx
sleep 5

echo "3/4 Requesting the real certificate for $DOMAIN and www.$DOMAIN..."
$DC run --rm --no-deps --entrypoint sh certbot -c "rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf"
STAGING_ARG=""
[ "${STAGING:-0}" = 1 ] && STAGING_ARG="--staging"
if ! $DC run --rm --no-deps --entrypoint certbot certbot certonly --webroot -w /var/www/certbot $STAGING_ARG \
  --email "$EMAIL" -d "$DOMAIN" -d "www.$DOMAIN" --rsa-key-size 4096 --agree-tos --no-eff-email --non-interactive; then
  echo "" >&2
  echo "The certificate request failed. Check that:" >&2
  echo "  - DNS A records for $DOMAIN and www.$DOMAIN point at this server (dig +short $DOMAIN)" >&2
  echo "  - ports 80 and 443 are open in the EC2 security group" >&2
  echo "Restoring the temporary certificate so Nginx keeps starting. Fix the cause and run this again." >&2
  make_dummy
  exit 1
fi

echo "4/4 Reloading Nginx with the real certificate..."
$DC exec -T nginx nginx -s reload
echo "Done. https://$DOMAIN should now work, and the certificate renews itself."
