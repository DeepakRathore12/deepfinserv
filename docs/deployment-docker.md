# Deploying DeepFinServ on EC2 with Docker

One server, five containers: **db** (Postgres 16), **api**, **web** (Next.js), **nginx** (the only thing exposed to the internet) and **certbot** (free HTTPS certificates, renewed automatically).

```
internet -> nginx :80/:443 -> web :3000   (pages)
                           -> api :4000   (/api/*) -> db :5432
```

Only nginx publishes ports. The database, API and web are reachable only inside the Docker network.

## 0. Before you start

You need:

- An AWS account and a domain (`deepfinserv.in`) whose DNS you can edit.
- The code on GitHub: `https://github.com/DeepakRathore12/deepfinserv` (private repos need a deploy key or a personal access token).
- For real customers: an approved MSG91 account (auth key, template id, sender id, DLT entity id). Without it, use the demo mode in step 4.

## 1. Create the EC2 instance

1. EC2 -> Launch instance.
2. **AMI:** Amazon Linux 2023.
3. **Type:** `t3.medium` (2 vCPU, 4 GB). `t3.small` (2 GB) works, but the image build can run out of memory, so add swap (step 2).
4. **Storage:** 30 GB gp3.
5. **Key pair:** you can choose "Proceed without a key pair". The steps below use the AWS console's browser terminal, which does not need a key file.
6. **Security group** (inbound):

   | Port | Source | Why |
   |------|--------|-----|
   | 22   | **My IP only** | Browser terminal / SSH (see note below) |
   | 80   | Anywhere | HTTP and certificate checks |
   | 443  | Anywhere | HTTPS |

   Do not open 3000, 4000 or 5432.
7. After launch, allocate an **Elastic IP** and attach it, so the address survives restarts.

**Open the server terminal from the AWS portal:** EC2 -> Instances -> select the instance -> **Connect** -> **EC2 Instance Connect** tab -> **Connect**. A terminal opens in the browser, logged in as `ec2-user`. If it says it cannot connect, add an inbound rule on port 22 for the **EC2 Instance Connect** IP range of your region (listed in the AWS docs under "EC2 Instance Connect"), then try again.

## 2. Prepare the server

```bash
# Run in the AWS browser terminal (Connect -> EC2 Instance Connect)

# System update, then Docker and git from the Amazon Linux repo
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
exit    # log in again so the docker group applies
```

Reconnect the browser terminal (close it and open Connect again), then install the Compose and Buildx plugins (they are not in the Amazon Linux repo):

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo curl -SL https://github.com/docker/buildx/releases/download/v0.17.1/buildx-v0.17.1.linux-amd64 -o /usr/local/lib/docker/cli-plugins/docker-buildx
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-*
docker compose version && docker buildx version
```

Check the memory first (`free -h`). Only on a 2 GB instance, add swap:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 3. Get the code

```bash
git clone https://github.com/DeepakRathore12/deepfinserv.git
cd deepfinserv
cp .env.example .env
nano .env
```

## 4. Fill in `.env`

Generate the secrets on the server:

```bash
openssl rand -hex 24      # POSTGRES_PASSWORD
openssl rand -base64 32   # run three times: DATA_ENCRYPTION_KEY, HASH_PEPPER, TOKEN_SECRET
```

**Back up the three keys somewhere other than this server** (password manager). Customer data is encrypted with them. If they are lost, the stored mobile numbers, emails and PAN data cannot be read again.

### Production (real customers)

```
COMPOSE_FILE=docker-compose.prod.yml
DOMAIN=deepfinserv.in
LETSENCRYPT_EMAIL=you@example.com
SITE_URL=https://www.deepfinserv.in
NGINX_CONF=prod-https
COOKIE_SECURE=true
ALLOW_INDEXING=false          # set true on launch day, then rebuild web (step 8)
NODE_ENV=production
OTP_PROVIDER=msg91            # plus the MSG91_* values
```

In production the API refuses to start with `OTP_PROVIDER=console`, and sample lenders are hidden.

### Demo or staging (no SMS yet)

Use this only for showing the site to the team, never with real customer data:

```
NODE_ENV=development
OTP_PROVIDER=console          # the OTP is always 123456
```

If you have no domain yet, test over plain HTTP by setting `NGINX_CONF=prod-http`, `COOKIE_SECURE=false` and `SITE_URL=http://<ELASTIC_IP>`.

## 5. Build and start

```bash
docker compose build api
docker compose build web
docker compose up -d db api web

# create tables, then seed lenders and the catalogue
docker compose run --rm api node dist/database/cli.js migrate
docker compose run --rm api node dist/database/cli.js seed
# demo mode only: add sample banks
# docker compose run --rm api node dist/database/cli.js seed --samples

# first admin login
docker compose run --rm api node dist/database/create-staff.js you@example.com "Your Name" admin
```

Build `api` and `web` one at a time, as shown above. Building both together can exhaust memory on small instances.

`create-staff` asks you to type a password (at least 12 characters). Running the same command again for the same email resets that user's password. Log in at `/admin/login`.

## 6. Point the domain and turn on HTTPS

1. At your DNS provider create **A records**: `deepfinserv.in` and `www.deepfinserv.in` -> the Elastic IP. Wait until `nslookup deepfinserv.in` returns that IP.
2. Run:

   ```bash
   bash infra/scripts/init-ssl.sh
   ```

   To rehearse without hitting Let's Encrypt rate limits, run `STAGING=1 bash infra/scripts/init-ssl.sh` first (browsers will show a warning), then `FORCE=1 bash infra/scripts/init-ssl.sh` for the real one.
3. Open `https://www.deepfinserv.in`. The apex redirects to `www`. Certificates renew automatically and nginx reloads every 6 hours to pick them up.

For a plain-HTTP-only setup (`NGINX_CONF=prod-http`), skip this step and run `docker compose up -d nginx`.

## 7. Check it works

```bash
docker compose ps                       # all "healthy" / "running"
curl -s https://www.deepfinserv.in/api/v1/health
docker compose logs -f api              # Ctrl+C to leave
```

Then in a browser: the home page, a loan calculator, and `/admin` login.

Note: the web image is built without access to the API, so pages are first generated with default data. After each deploy, live data such as the partner banks strip and current rates appears within an hour, when the pages refresh on their own. This is expected, not a fault.

## 8. Updating the site

```bash
cd ~/deepfinserv
bash infra/scripts/backup-db.sh                    # always take a backup first
git pull
docker compose build api
docker compose build web
docker compose run --rm api node dist/database/cli.js migrate
docker compose up -d api web
```

Changes to `SITE_URL`, `GTM_ID`, `GA4_ID`, `GSC_VERIFICATION` or `ALLOW_INDEXING` are baked into the web image, so rebuild `web` after editing them. Changes to the other `.env` values only need `docker compose up -d api`.

**Rollback:** `git checkout <previous-commit>`, rebuild, `up -d`. Migrations are forward-only; restore a backup if one must be undone.

## 9. Backups

```bash
bash infra/scripts/backup-db.sh        # writes ./backups/dk-<timestamp>.sql.gz, keeps the newest 14
crontab -e
# every night at 02:30:
30 2 * * * cd /home/ec2-user/deepfinserv && bash infra/scripts/backup-db.sh >> backups/cron.log 2>&1
```

Copy backups off the server too (an S3 bucket via `aws s3 sync ./backups s3://your-bucket/backups`, or EBS snapshots of the volume). Restore:

```bash
gunzip -c backups/<file>.sql.gz | docker compose exec -T db psql -U dk dk_finance
```

## 10. Everyday commands

| Task | Command |
|------|---------|
| Status | `docker compose ps` |
| Live logs | `docker compose logs -f api` (or `web`, `nginx`, `db`) |
| Restart one service | `docker compose restart api` |
| Stop everything | `docker compose down` (data is kept) |
| Disk usage | `docker system df`; clean with `docker image prune -f` |
| Database shell | `docker compose exec db psql -U dk dk_finance` |

**Never** run `docker compose down -v`: it deletes the database volume and the certificates.

## 11. Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `api` keeps restarting | `docker compose logs api`. Usually a missing or short key, or `OTP_PROVIDER=console` with `NODE_ENV=production`. |
| nginx will not start | No certificate yet. Run `init-ssl.sh`, or use `NGINX_CONF=prod-http`. |
| Certificate request fails | DNS not pointing at the server yet, or port 80 closed in the security group. |
| 502 Bad Gateway | `api` or `web` is down or still starting. Check `docker compose ps`. |
| Cannot log in to `/admin` over HTTP | `COOKIE_SECURE=true` needs HTTPS. Use `false` only for HTTP testing. |
| Logo upload fails | Image over 200 KB, or not PNG/JPEG/WebP (SVG is refused). |
| Build killed | Out of memory. Add swap (step 2) or use a bigger instance. |

## Known limits

- The old PM2 GitHub Actions workflow (`.github/workflows/deploy.yml`) does not apply to Docker. Deploy with step 8.
- Single server, no automatic failover. Backups and a snapshot schedule are your safety net.
