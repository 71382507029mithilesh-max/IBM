#!/usr/bin/env bash
# ==========================================================
# StayEase - Automated MySQL Database Backup Script
# Performs logical dumps with gzip compression and S3 sync
# ==========================================================

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/opt/stayease/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-hotel_user}"
DB_PASSWORD="${DB_PASSWORD:-hotel_password_secure_2026}"
DB_NAME="${DB_NAME:-hotel_booking_db}"
S3_BUCKET="${S3_BACKUP_BUCKET:-s3://stayease-database-backups-production}"

BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting StayEase database backup..."

# 1. Execute consistent mysqldump with single transaction for zero downtime
mysqldump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --user="${DB_USER}" \
  --password="${DB_PASSWORD}" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "[$(date)] Backup snapshot created successfully at ${BACKUP_FILE}"
ls -lh "${BACKUP_FILE}"

# 2. Upload to Cloud Backup Storage (AWS S3) if AWS CLI is configured
if command -v aws &> /dev/null; then
  echo "[$(date)] Syncing backup snapshot to off-site cloud storage: ${S3_BUCKET}..."
  aws s3 cp "${BACKUP_FILE}" "${S3_BUCKET}/${DB_NAME}_backup_${TIMESTAMP}.sql.gz" --sse AES256
  echo "[$(date)] Off-site cloud upload complete."
fi

# 3. Retain only last 7 days of local backups
find "${BACKUP_DIR}" -type f -name "${DB_NAME}_backup_*.sql.gz" -mtime +7 -delete
echo "[$(date)] Retention rotation completed."
