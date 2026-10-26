#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# بکاپ‌گیر ماهی تنور — دیتابیس SQLite + عکس‌های آپلودی
# استفاده:  ./scripts/backup.sh <مسیر پروژه>  (پیش‌فرض: مسیر فعلی)
# کرون:     هر ۶ ساعت یک‌بار (نگهداری ۱۴ نسخه اخیر)
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

APP_DIR="${1:-$(pwd)}"
DB_FILE="$APP_DIR/db/custom.db"
UPLOAD_DIR="$APP_DIR/public/uploads"
BACKUP_ROOT="${BACKUP_DIR:-$APP_DIR/backups}"
KEEP=14              # تعداد نسخه‌های نگه‌داشتنی
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="$BACKUP_ROOT/$STAMP"

[ -f "$DB_FILE" ] || { echo "❌ دیتابیس پیدا نشد: $DB_FILE"; exit 1; }
mkdir -p "$DEST"

# ── ۱) بکاپ امن دیتابیس (آنلاین، بدون قفل‌کردن سرویس) ──
# اگر sqlite3 موجود بود از دستور .backup استفاده می‌کنیم (سازگار با WAL و تراکنش‌های در جریان)
if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "$DB_FILE" ".backup '$DEST/custom.db'"
else
  # روش جایگزین: کپی دو فایل اصلی + checkpoint با PRAGMA (اگر sqlite3 نبود)
  cp "$DB_FILE" "$DEST/custom.db"
  [ -f "$DB_FILE-wal" ] && cp "$DB_FILE-wal" "$DEST/custom.db-wal" || true
  [ -f "$DB_FILE-shm" ] && cp "$DB_FILE-shm" "$DEST/custom.db-shm" || true
fi

# ── ۲) بکاپ عکس‌های آپلودشده از پنل ادمین ──
if [ -d "$UPLOAD_DIR" ]; then
  tar -czf "$DEST/uploads.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
fi

# ── ۳) چک‌سام برای اطمینان از سلامت ──
( cd "$DEST" && sha256sum * > SHA256SUMS 2>/dev/null || true )

# ── ۴) فشرده‌سازی دیتابیس ──
gzip -f "$DEST/custom.db"

# ── ۵) چرخش — حذف نسخه‌های قدیمی‌تر از KEEP ──
cd "$BACKUP_ROOT"
ls -1d */ 2>/dev/null | sort | head -n -"$KEEP" | xargs -r rm -rf

echo "✅ بکاپ انجام شد: $DEST"
ls -lh "$DEST" | tail -n +2
