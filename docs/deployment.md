# Deployment (AWS EC2 + RDS)

## One-time setup

1. RDS PostgreSQL 16, private subnet, encryption at rest, automated backups (14 days), `rds.force_ssl=1`.
   Security group allows 5432 only from the EC2 security group.
2. EC2 (t3.small is enough to start), Ubuntu 24.04, in a public subnet with an Elastic IP. Security group:
   80 and 443 from anywhere, 22 only from your office IP or use SSM Session Manager instead.
3. Instance role with `ssm:GetParametersByPath` and `kms:Decrypt` on `/dkfinance/prod/*`.
4. On the host:
   ```bash
   sudo adduser --system --group --home /srv/dkfinance dkfinance
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash - && sudo apt install -y nodejs nginx certbot python3-certbot-nginx
   sudo npm i -g pm2 && sudo -u dkfinance pm2 startup   # run the command it prints
   sudo cp infra/nginx/dkfinance.conf /etc/nginx/sites-available/ && sudo ln -s ../sites-available/dkfinance.conf /etc/nginx/sites-enabled/
   sudo certbot --nginx -d deepfinserv.in -d www.deepfinserv.in
   ```
5. SSM parameters (SecureString) under `/dkfinance/prod/api/`: `DATABASE_URL` (with `sslmode=require`),
   `DATABASE_SSL=true`, `DATA_ENCRYPTION_KEY`, `HASH_PEPPER`, `TOKEN_SECRET`, `OTP_PROVIDER=msg91`,
   `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `CORS_ORIGINS=https://deepfinserv.in`, `COOKIE_SECURE=true`.
   Under `/dkfinance/prod/web/`: `API_INTERNAL_URL=http://127.0.0.1:4000/api/v1`.
   Then `sudo infra/scripts/fetch-env.sh`.
6. GitHub: create the `production` environment with required reviewers, and secrets `DEPLOY_SSH_KEY`,
   `DEPLOY_HOST`, `DEPLOY_KNOWN_HOSTS`; variables `GTM_ID`, `GSC_VERIFICATION`.
7. After the first deploy: `node --env-file=/etc/dkfinance/api.env dist/database/cli.js seed` (no
   `--samples`) and create staff users with `dist/database/create-staff.js`.

## Each release

Push a tag `v*` (or run the Deploy workflow). CI builds, packages a release, copies it to the host and runs
`infra/scripts/deploy.sh`: unpack, migrate, switch the `current` symlink, `pm2 startOrReload`, health check,
keep five releases.

Rollback: `ln -sfn /srv/dkfinance/releases/<previous> /srv/dkfinance/current && pm2 reload all`. If the bad
release ran a migration, roll that back first with `cli.js rollback` from the bad release.

## Monitoring

- PM2 logs are JSON (pino); ship them with the CloudWatch agent and alarm on `level>=50`.
- Uptime check on `/api/v1/health` and `/`.
- RDS CPU, free storage and connection count alarms.
- Admin overview shows overdue grievances; check it daily.
