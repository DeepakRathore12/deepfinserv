#!/usr/bin/env bash
# Runs on the EC2 host as the dkfinance user. Usage: deploy.sh <release.tar.gz>
# Unpacks a CI-built release, migrates, switches the symlink and reloads PM2 with zero downtime.
set -euo pipefail
TARBALL="$1"
BASE=/srv/dkfinance
REL="$BASE/releases/$(date +%Y%m%d%H%M%S)"
mkdir -p "$REL"
tar -xzf "$TARBALL" -C "$REL"

cd "$REL/apps/backend"
node --env-file=/etc/dkfinance/api.env dist/database/cli.js migrate

ln -sfn "$REL" "$BASE/current.new" && mv -Tf "$BASE/current.new" "$BASE/current"
cd "$BASE/current"
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

for i in $(seq 1 20); do
  curl -fsS http://127.0.0.1:4000/api/v1/health >/dev/null && curl -fsS -o /dev/null http://127.0.0.1:3000/ && break
  sleep 1
  [ "$i" = 20 ] && { echo "Health check failed"; exit 1; }
done

# Keep the last five releases for quick rollback: ln -sfn <older release> current && pm2 reload all
ls -1dt "$BASE"/releases/* | tail -n +6 | xargs -r rm -rf
echo "Deployed $REL"
