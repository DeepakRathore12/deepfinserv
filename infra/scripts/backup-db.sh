#!/usr/bin/env bash
# Dumps the database to ./backups as a compressed SQL file and keeps the newest 14.
#   bash infra/scripts/backup-db.sh
# Daily at 02:30 from cron (crontab -e):
#   30 2 * * * cd /opt/deepfinserv && bash infra/scripts/backup-db.sh >> backups/backup.log 2>&1
#
# Customer details inside the dump are encrypted, so a dump is useless without DATA_ENCRYPTION_KEY from .env.
# Keep that key somewhere else too, and copy the backups off the server (S3, or an EBS snapshot of the disk).
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p backups
OUT="backups/dk_finance-$(date +%F-%H%M).sql.gz"
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U dk --no-owner dk_finance | gzip > "$OUT"
# A failed dump leaves a tiny file; refuse to keep one.
if [ "$(stat -c %s "$OUT")" -lt 1000 ]; then rm -f "$OUT"; echo "Backup failed: dump is empty" >&2; exit 1; fi
ls -1t backups/dk_finance-*.sql.gz | tail -n +15 | xargs -r rm -f
echo "Saved $OUT"
