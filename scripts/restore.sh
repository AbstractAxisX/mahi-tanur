#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# بازگردانی بکاپ ماهی تنور
# استفاده: ./scripts/restore.sh <پوشهٔ بکاپ> <مسیر پروژه>
#   ./scripts/restore.sh backups/20250101-120000 /var/www/mahi-tanur
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SRC="${1:?استفاده: restore.sh <پوشه بکاپ> <مسیر پروژه>}"
APP_DIR="${2:-$(pwd)}"
DB_FILE="$APP_DIR/db/custom.db"

[ -f "$SRC/custom.db.gz" ] || { echo "❌ فایل بکاپ دیتابیس پیدا نشد در $SRC"; exit 1; }

echo "⏸  توقف سرویس..."
pm2 stop mahi-tanur 2>/dev/null || true

# بکاپ امنتیاتی از دیتابیس فعلی قبل از بازگردانی
if [ -f "$DB_FILE" ]; then
  cp "$DB_FILE" "$DB_FILE.pre-restore.$(date +%s)"
fi

echo "📥 بازگردانی دیتابیس..."
gunzip -c "$SRC/custom.db.gz" > "$DB_FILE"
rm -f "$DB_FILE-wal" "$DB_FILE-shm"

if [ -f "$SRC/uploads.tar.gz" ]; then
  echo "📥 بازگردانی عکس‌های آپلودی..."
  tar -xzf "$SRC/uploads.tar.gz" -C "$APP_DIR/public" 2>/dev/null || tar -xzf "$SRC/uploads.tar.gz" -C "$APP_DIR/public/.."
fi

echo "▶️  راه‌اندازی مجدد سرویس..."
pm2 start mahi-tanur 2>/dev/null || pm2 restart mahi-tanur 2>/dev/null || true

echo "✅ بازگردانی کامل شد."
