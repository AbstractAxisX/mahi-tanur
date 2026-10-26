#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# اسکریپت استقرار «ماهی تنور» روی سرور پروداکشن (اجرا به‌عنوان root)
# - نصب Node.js 22 + PM2 + Nginx + SQLite3 (در صورت نبود)
# - کلون پروژه از گیت‌هاب (بدون دیتای تستی — فقط seed پروداکشن)
# - بیلد standalone + اجرا با PM2 + پروکسی معکوس Nginx
# - کرون بکاپ هر ۶ ساعت
# idempotent است — اجرای مجدد امن است (pull + rebuild + restart)
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

APP_NAME="mahi-tanur"
APP_DIR="/var/www/$APP_NAME"
REPO="https://github.com/AbstractAxisX/mahi-tanur.git"
PORT=3000
NODE_MAJOR=22

log() { echo -e "\n\033[1;36m═══ $* ═══\033[0m"; }

# ─────────────────────────── ۱) پیش‌نیازها ───────────────────────────
log "بررسی/نصب پیش‌نیازها"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y -qq

if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -dv -f1 | cut -d. -f1)" -lt 20 ]; then
  log "نصب Node.js $NODE_MAJOR (NodeSource)"
  apt-get install -y -qq ca-certificates curl gnupg
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg 2>/dev/null || true
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
  apt-get update -y -qq
  apt-get install -y -qq nodejs
fi
command -v node >/dev/null 2>&1 || { echo "❌ node نصب نشد"; exit 1; }
echo "Node: $(node -v)"

for pkg in git nginx sqlite3; do
  command -v $pkg >/dev/null 2>&1 || apt-get install -y -qq $pkg
done
command -v pm2 >/dev/null 2>&1 || npm install -g pm2 --silent
echo "PM2: $(pm2 -v)"

# ── swap برای سرورهای کم‌حافظه (بیلد Next.js حافظه‌بر است) ──
MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
if [ "$MEM_MB" -lt 2000 ] && [ ! -f /swapfile ]; then
  log "ساخت ۲GB swap (سرور کم‌حافظه است)"
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# ─────────────────────────── ۲) دریافت پروژه ───────────────────────────
log "دریافت کد از گیت‌هاب"
mkdir -p /var/www
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git fetch --all --quiet && git reset --hard origin/main --quiet
else
  rm -rf "$APP_DIR"
  git clone --depth 1 "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi
git log --oneline -1

# ─────────────────────────── ۳) نصب پکیج‌ها ───────────────────────────
log "نصب پکیج‌ها (npm)"
npm install --legacy-peer-deps --no-audit --no-fund --loglevel=error

# ─────────────────────────── ۴) دیتابیس (بدون دیتای تستی!) ───────────────────────────
log "آماده‌سازی دیتابیس — بدون دیتای تستی"
mkdir -p db
cat > .env <<EOF
DATABASE_URL=file:$APP_DIR/db/custom.db
ADMIN_PASS=admin123
EOF
npx prisma generate --quiet
npx prisma db push --accept-data-loss --skip-generate

# seed پروداکشن: فقط تنظیمات سایت + بازه زمانی + روش ارسال (بدون ماهی/سفارش تستی)
npx --yes tsx prisma/seed-prod.ts

# ─────────────────────────── ۵) بیلد ───────────────────────────
log "بیلد Next.js (standalone)"
export DATABASE_URL="file:$APP_DIR/db/custom.db"
npm run build

# آپلودهای بعد از بیلد باید سرو شوند → سیم‌لینک پوشهٔ uploads
mkdir -p public/uploads
rm -rf .next/standalone/public/uploads
ln -sfn "$APP_DIR/public/uploads" ".next/standalone/public/uploads"

# ─────────────────────────── ۶) PM2 ───────────────────────────
log "راه‌اندازی با PM2"
cat > ecosystem.config.cjs <<EOF
module.exports = {
  apps: [{
    name: "$APP_NAME",
    script: ".next/standalone/server.js",
    cwd: "$APP_DIR",
    env: {
      NODE_ENV: "production",
      PORT: "$PORT",
      HOSTNAME: "0.0.0.0",
      DATABASE_URL: "file:$APP_DIR/db/custom.db",
      ADMIN_PASS: "admin123",
    },
    max_memory_restart: "400M",
    exp_backoff_restart_delay: 200,
  }]
}
EOF
pm2 delete $APP_NAME >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# ─────────────────────────── ۷) Nginx ───────────────────────────
log "پیکربندی Nginx"
cat > /etc/nginx/sites-available/$APP_NAME <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 12M;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;
    gzip_min_length 1024;

    # عکس‌های آپلودی مستقیم از دیسک (بدون عبور از نود)
    location /uploads/ {
        alias $APP_DIR/public/uploads/;
        expires 7d;
        access_log off;
        try_files \$uri @proxy;
    }

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }

    location @proxy {
        proxy_pass http://127.0.0.1:$PORT;
    }
}
EOF
# غیرفعال‌کردن سایت پیش‌فرض اگر تداخل داشت
[ -f /etc/nginx/sites-enabled/default ] && rm -f /etc/nginx/sites-enabled/default
ln -sfn /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME
nginx -t && systemctl enable nginx --quiet && systemctl restart nginx

# ─────────────────────────── ۸) کرون بکاپ ───────────────────────────
log "تنظیم کرون بکاپ (هر ۶ ساعت + نگهداری ۱۴ نسخه)"
chmod +x scripts/*.sh
CRON_LINE="0 */6 * * * root $APP_DIR/scripts/backup.sh $APP_DIR >> $APP_DIR/backups/backup.log 2>&1"
mkdir -p "$APP_DIR/backups"
( crontab -l 2>/dev/null | rg -v "backup.sh $APP_DIR" ; echo "$CRON_LINE" ) | crontab -
# فایل cron سیستمی هم برای اطمینان (root)
echo "$CRON_LINE" > /etc/cron.d/mahi-tanur-backup
chmod 644 /etc/cron.d/mahi-tanur-backup

# اولین بکاپ همین حالا
"$APP_DIR/scripts/backup.sh" "$APP_DIR" || true

# ─────────────────────────── ۹) فایروال ───────────────────────────
if command -v ufw >/dev/null 2>&1 && ufw status | rg -q "active"; then
  ufw allow 80/tcp  >/dev/null 2>&1 || true
  ufw allow 443/tcp >/dev/null 2>&1 || true
fi

log "✅ استقرار کامل شد"
echo "─────────────────────────────────"
echo " سایت:      http://$(curl -s --max-time 3 ifconfig.me 2>/dev/null || echo SERVER_IP)/"
echo " پنل ادمین: admin / admin123 (قابل تغییر از \$ADMIN_PASS در .env)"
echo " بکاپ‌ها:   $APP_DIR/backups/  (هر ۶ ساعت، ۱۴ نسخه)"
echo " وضعیت PM2:"
pm2 ls
