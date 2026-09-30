#!/usr/bin/env bash
# ==========================================================
# StayEase - Database Disaster Recovery & Restoration Script
# Restores database from a compressed snapshot file
# ==========================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path_to_backup.sql.gz>"
  echo "Example: $0 /opt/stayease/backups/hotel_booking_db_backup_20260930_120000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-hotel_user}"
DB_PASSWORD="${DB_PASSWORD:-hotel_password_secure_2026}"
DB_NAME="${DB_NAME:-hotel_booking_db}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file ${BACKUP_FILE} does not exist!"
  exit 1
fi

echo "=========================================================="
echo "STAYEASE DISASTER RECOVERY RESTORATION"
echo "Target Host: ${DB_HOST}:${DB_PORT}"
echo "Database:    ${DB_NAME}"
echo "Source File: ${BACKUP_FILE}"
echo "=========================================================="
read -p "Proceed with database restoration? This will overwrite existing records (y/N): " CONFIRM
if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
  echo "Restoration aborted by operator."
  exit 0
fi

echo "[$(date)] Beginning restoration..."
gunzip -c "${BACKUP_FILE}" | mysql \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --user="${DB_USER}" \
  --password="${DB_PASSWORD}" \
  "${DB_NAME}"

echo "[$(date)] Database restored successfully!"
echo "[$(date)] Verifying hotel record count..."
mysql \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --user="${DB_USER}" \
  --password="${DB_PASSWORD}" \
  -e "SELECT COUNT(*) as restored_hotels_count FROM ${DB_NAME}.hotels;"

echo "[$(date)] System ready to resume traffic."
