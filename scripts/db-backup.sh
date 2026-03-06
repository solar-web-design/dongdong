#!/bin/bash
# PostgreSQL 자동 백업 스크립트
# Cron 예시: 0 3 * * * /path/to/db-backup.sh

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_FILE="${BACKUP_DIR}/dongdong_${TIMESTAMP}.sql.gz"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

echo "[$(date)] Backup saved: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Upload to S3 (optional)
if [ -n "${S3_BACKUP_BUCKET:-}" ]; then
  aws s3 cp "$BACKUP_FILE" "s3://${S3_BACKUP_BUCKET}/db-backups/$(basename "$BACKUP_FILE")"
  echo "[$(date)] Uploaded to S3: s3://${S3_BACKUP_BUCKET}/db-backups/$(basename "$BACKUP_FILE")"
fi

# Cleanup old backups
find "$BACKUP_DIR" -name "dongdong_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
echo "[$(date)] Cleaned up backups older than ${RETENTION_DAYS} days"
