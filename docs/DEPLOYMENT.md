# راهنمای دیپلوی روی VPS (Docker + nginx + MinIO، دیتابیس روی هاست)

این راهنما فرض می‌کند یک VPS خام اوبونتو/دبیان دارید و دامنه‌تان (مثلاً `armanco.com`) به IP همان سرور اشاره می‌کند. کل استک با یک `docker compose up` بالا می‌آید، **به‌جز دیتابیس MySQL که مستقیماً روی خود سرور نصب می‌شود** (نه داخل داکر).

## چرا دیتابیس داخل داکر نه؟

برای یک سرور تکی مثل این، نگه‌داشتن MySQL در کانتینر فقط پیچیدگی اضافه می‌کند (مدیریت volume، بکاپ‌گیری از داخل کانتینر، ریسک از دست رفتن داده اگر یک روز کسی اشتباهی `docker compose down -v` بزند) بدون فایده‌ی واقعی — چون همه‌چیز روی همین یک سرور اجراست و نیازی به portability بین محیط‌ها نیست. نصب مستقیم MySQL روی هاست، بکاپ‌گیری و مانیتورینگش را ساده‌تر و امن‌تر می‌کند.

---

## ۱. آماده‌سازی سرور

```bash
# آپدیت پایه
sudo apt update && sudo apt upgrade -y

# فایروال — فقط SSH، HTTP، HTTPS باز باشد
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# نصب Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# یک بار خارج شوید و دوباره SSH بزنید تا عضویت گروه docker اعمال شود
```

## ۲. نصب MySQL روی هاست (نه داکر)

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation   # رمز root، حذف کاربر ناشناس و... را طی کنید
```

یک دیتابیس و یک کاربر مخصوص اپ بسازید (وارد `sudo mysql` شوید):

```sql
CREATE DATABASE armaan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'armaan_app'@'%' IDENTIFIED BY 'یک-رمز-قوی-اینجا';
GRANT ALL PRIVILEGES ON armaan.* TO 'armaan_app'@'%';
FLUSH PRIVILEGES;
```

> از `'%'` (هر هاست) استفاده شده چون اپ داخل کانتینر داکر است و از IP شبکه‌ی داخلی داکر (نه واقعاً `localhost`) وصل می‌شود. این خطری ندارد چون در مرحله‌ی بعد پورت ۳۳۰۶ را روی فایروال **عمومی** باز نمی‌کنیم — فقط از داخل خود سرور (از کانتینر) قابل دسترسی می‌ماند.

MySQL را طوری تنظیم کنید که روی شبکه‌ی داخلی داکر هم گوش بدهد، نه فقط `127.0.0.1`:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# خط bind-address را به این تغییر دهید (یعنی روی همه‌ی اینترفیس‌ها، از جمله شبکه‌ی داکر، گوش بده):
# bind-address = 0.0.0.0
sudo systemctl restart mysql
```

⚠️ **پورت ۳۳۰۶ را در `ufw` باز نکنید** — چون `bind-address = 0.0.0.0` فقط یعنی MySQL از داخل سرور روی همه‌ی اینترفیس‌ها (شامل پل داکر) قابل دسترسی است؛ فایروال جلوی دسترسی از اینترنت را می‌گیرد. با `sudo ufw status` مطمئن شوید ۳۳۰۶ باز نیست.

## ۳. آوردن پروژه روی سرور

```bash
sudo mkdir -p /opt/armaan && sudo chown $USER:$USER /opt/armaan
cd /opt/armaan
git clone <آدرس-ریپوی-گیت‌هاب-شما> .
```

## ۴. تنظیم `.env`

```bash
cp .env.example .env
nano .env
```

مقادیر زیر را حتماً با مقدار واقعی پر کنید (توضیح هرکدام داخل خود `.env.example` هست):

- `DATABASE_URL` — با کاربر/رمز مرحله‌ی ۲، هاست `host.docker.internal` (نمونه داخل فایل هست)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` — هش را با این دستور بسازید (به Node.js روی هاست نیاز دارد، مرحله‌ی بعد):
  ```bash
  node -e "require('bcryptjs').hash(process.argv[1], 10).then(h => console.log(h.replace(/\$/g, '\$\$')))" 'رمز-دلخواه-ادمین'
  ```
  ⚠️ خروجی این دستور را **دقیقاً همان‌طور که هست** (با علامت‌های `$$` دوتایی) در `.env` کپی کنید — چون Docker Compose علامت `$` تکی داخل `.env` را به‌اشتباه به‌عنوان متغیر تفسیر می‌کند و هش را خراب می‌کند (توضیح کامل داخل `.env.example` هست).
- `JWT_SECRET` — با `openssl rand -base64 48`
- `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` (این دو جفت را یکسان بگذارید، ساده‌تر است)، `MINIO_BUCKET`
- `NEXT_PUBLIC_COMPANY_*` و `NEXT_PUBLIC_SOCIAL_*` — اطلاعات واقعی نهایی سایت
- `DOMAIN` — دامنه‌ی واقعی (بدون `https://`)
- `CERTBOT_EMAIL` — ایمیل شما، برای اطلاع‌رسانی انقضای گواهی

## ۵. نصب Node.js روی هاست (فقط برای دستورات یک‌باره — نه اجرای اپ)

اپ اصلی همیشه داخل داکر اجرا می‌شود؛ اما دستورات یک‌باره‌ی ادمین (migration دیتابیس، هش رمز، مهاجرت آپلودهای قدیمی) به Node نیاز دارند:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
cd /opt/armaan
npm install
```

سپس migration دیتابیس را اجرا کنید (به همان MySQL هاست وصل می‌شود، پس در `.env` موقتاً `DATABASE_URL` را با `localhost` به‌جای `host.docker.internal` بزنید یا صرفاً چون هر دو روی یک سرورند مقدار `127.0.0.1` هم کار می‌کند اگر `bind-address` طوری تنظیم شده باشد؛ ساده‌تر: یک متغیر موقت پاس بدهید):

```bash
DATABASE_URL="mysql://armaan_app:رمز-شما@127.0.0.1:3306/armaan" npm run db:push
```

## ۶. صدور گواهی SSL (فقط بار اول)

مطمئن شوید DNS دامنه‌تان از قبل به IP سرور اشاره می‌کند (چند دقیقه تا انتشار طول می‌کشد)، سپس:

```bash
./nginx/init-letsencrypt.sh
```

این اسکریپت یک گواهی موقت می‌سازد تا nginx بالا بیاید، سپس گواهی واقعی را از Let's Encrypt می‌گیرد و nginx را reload می‌کند. تمدید گواهی بعداً خودکار انجام می‌شود (سرویس `certbot` در `docker-compose.yml`).

## ۷. بالا آوردن کل استک

```bash
docker compose up -d --build
docker compose ps        # همه باید Up/healthy باشند
docker compose logs -f app   # بررسی لاگ اپ در صورت مشکل
```

حالا سایت باید روی `https://دامنه‌تان` بالا باشد.

## ۸. مهاجرت فایل‌های آپلودی قدیمی (فقط اگر `public/uploads` محتوا دارد)

```bash
npm run migrate:uploads
```

این اسکریپت فایل‌های قبلی را به MinIO منتقل کرده و رفرنس‌هایشان را در دیتابیس/محتوای مقالات آپدیت می‌کند.

## بروزرسانی بعدی پروژه

```bash
cd /opt/armaan
git pull
docker compose up -d --build app   # فقط اپ را rebuild و ری‌استارت می‌کند
# اگر schema دیتابیس عوض شده:
DATABASE_URL="mysql://armaan_app:رمز-شما@127.0.0.1:3306/armaan" npm run db:push
```

## بکاپ‌گیری

**دیتابیس** (روی هاست، با cron روزانه):

```bash
mysqldump -u armaan_app -p armaan | gzip > /opt/backups/armaan-db-$(date +%F).sql.gz
```

**فایل‌های MinIO** (volume داکر):

```bash
docker run --rm -v armaan_minio_data:/data -v /opt/backups:/backup alpine \
  tar czf /backup/minio-backup-$(date +%F).tar.gz -C /data .
```

(نام دقیق volume را با `docker volume ls` چک کنید.)

## عیب‌یابی سریع

| مشکل | بررسی کنید |
|---|---|
| سایت بالا نمی‌آید | `docker compose logs app` — معمولاً یعنی اتصال به `DATABASE_URL` برقرار نشده |
| خطای 502 از nginx | `docker compose logs nginx` و `docker compose ps app` — یعنی کانتینر app کرش کرده یا هنوز healthy نشده |
| گواهی SSL صادر نشد | مطمئن شوید DNS دامنه به IP سرور می‌رسد و پورت‌های ۸۰/۴۴۳ در `ufw` باز هستند؛ `docker compose logs certbot` را ببینید |
| آپلود عکس/ویدیو کار نمی‌کند | `docker compose logs minio` و `docker compose logs app` — پیام‌های `[upload]`/`[media proxy]` مشکل را نشان می‌دهند |
| نمی‌توانم به کنسول MinIO وصل شوم | عمداً فقط روی `127.0.0.1:9001` سرور باز است؛ با `ssh -L 9001:localhost:9001 user@server-ip` تانل بزنید و `http://localhost:9001` را در مرورگر خودتان باز کنید |
