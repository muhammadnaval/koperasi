# Panduan Produksi & Deployment KPRI MTsN 3 Kota Padang

Panduan ini merupakan petunjuk teknis lengkap untuk mengoperasikan, mengonfigurasi, dan memelihara aplikasi **Koperasi Simpan Pinjam KPRI MTsN 3 Kota Padang** pada server produksi **CloudPanel** dengan domain [https://kpri.mtsn3padang.sch.id](https://kpri.mtsn3padang.sch.id).

---

## 📋 Spesifikasi Lingkungan Produksi

| Parameter | Nilai Produksi |
|---|---|
| **Domain Utama** | `kpri.mtsn3padang.sch.id` |
| **URL Produksi** | `https://kpri.mtsn3padang.sch.id` |
| **Control Panel** | CloudPanel |
| **Web Server / Reverse Proxy** | Nginx -> PHP-FPM 8.5 |
| **Versi PHP** | PHP 8.5 (Strict Mode enabled) |
| **Database** | PostgreSQL 18 |
| **Framework Backend** | Laravel 13 |
| **Framework Frontend** | Inertia.js v3 + React 19 + TypeScript + Tailwind CSS |
| **Lokasi Directory Server** | `/home/kpri-mtsn3padang/htdocs/kpri.mtsn3padang.sch.id` |
| **Document Root Nginx** | `/home/kpri-mtsn3padang/htdocs/kpri.mtsn3padang.sch.id/public` |
| **Zona Waktu** | `Asia/Jakarta` (WIB) |
| **Mata Uang** | Indonesian Rupiah (IDR / Rp) |

---

## 🔑 1. Pengaturan GitHub Secrets (Untuk CI/CD Otomatis)

Buka repository GitHub Anda di:  
`https://github.com/muhammadnaval/koperasi/settings/secrets/actions`

Tambahkan **Repository Secrets** berikut agar deployment otomatis berjalan setiap kali ada push ke branch `main`:

| Nama Secret | Deskripsi / Contoh Nilai |
|---|---|
| `SSH_HOST` | IP Address Server CloudPanel Anda (misal: `103.127.xxx.xxx`) |
| `SSH_USER` | Username user SSH CloudPanel (misal: `kpri-mtsn3padang`) |
| `SSH_KEY` | Isi Private Key SSH (`id_rsa` / `id_ed25519`) tanpa passphrase |
| `SSH_PORT` | Port SSH server (default: `22`) |
| `TARGET_DIR` | `/home/kpri-mtsn3padang/htdocs/kpri.mtsn3padang.sch.id` |

---

## 🚀 2. Instalasi Awal di Server CloudPanel (First-Time Setup)

Jalankan perintah berikut melalui koneksi SSH ke server CloudPanel Anda:

### Langkah A: Clone Repository
```bash
cd /home/kpri-mtsn3padang/htdocs
git clone https://github.com/muhammadnaval/koperasi.git kpri.mtsn3padang.sch.id
cd kpri.mtsn3padang.sch.id
```

### Langkah B: Buat File Environment Produksi (`.env`)
```bash
cp .env.production.example .env
php artisan key:generate
```

Edit file `.env` menggunakan `nano .env` dan pastikan konfigurasi berikut terisi dengan benar:
```env
APP_NAME="Koperasi Simpan Pinjam KPRI MTsN 3 Kota Padang"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://kpri.mtsn3padang.sch.id
APP_TIMEZONE=Asia/Jakarta

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=kpri_koperasi_prod
DB_USERNAME=kpri_db_user
DB_PASSWORD=PASSWORD_DATABASE_SANGAT_RAHASIA

SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
QUEUE_CONNECTION=database
CACHE_STORE=database
```

### Langkah C: Install Dependencies & Build Asset Frontend
```bash
composer install --no-dev --optimize-autoloader --no-interaction
npm ci
npm run build
```

### Langkah D: Jalankan Migrasi Database & Seeder Awal
```bash
php artisan migrate --force
php artisan db:seed --force
```

### Langkah E: Buat Symbolic Link Storage & Optimasi Cache
```bash
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## ⚙️ 3. Konfigurasi Nginx, Cron Scheduler & Queue Worker

### 3.1 Nginx Reverse Proxy & SSL
Pada CloudPanel, buka **Sites -> kpri.mtsn3padang.sch.id -> Vhost** dan pastikan document root diarahkan ke folder `/public`:
```nginx
root /home/kpri-mtsn3padang/htdocs/kpri.mtsn3padang.sch.id/public;

location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass unix:/run/php/php8.5-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    include fastcgi_params;
}
```
Aktifkan SSL Let's Encrypt secara otomatis melalui tab **SSL/TLS** pada CloudPanel.

---

### 3.2 Cron Job Scheduler (Laravel Cron)
Jalankan `crontab -e` pada user server dan tambahkan satu baris scheduler ini:
```cron
* * * * * cd /home/kpri-mtsn3padang/htdocs/kpri.mtsn3padang.sch.id && php artisan schedule:run >> /dev/null 2>&1
```

---

### 3.3 Supervisor Queue Worker
Salin file konfigurasi supervisor ke `/etc/supervisor/conf.d/koperasi-worker.conf`:
```ini
[program:koperasi-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /home/kpri-mtsn3padang/htdocs/kpri.mtsn3padang.sch.id/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=kpri-mtsn3padang
numprocs=2
redirect_stderr=true
stdout_logfile=/home/kpri-mtsn3padang/htdocs/kpri.mtsn3padang.sch.id/storage/logs/worker.log
```

Aktifkan worker dengan perintah:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start koperasi-worker:*
```

---

## 🛡️ 4. Prosedur Backup & Pemulihan (Backup & Recovery)

### 4.1 Backup Database Otomatis (PostgreSQL `pg_dump`)
Buat script backup harian di `/home/kpri-mtsn3padang/backups/backup_db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/kpri-mtsn3padang/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/db_koperasi_$TIMESTAMP.sql.gz"

pg_dump -U kpri_db_user -h 127.0.0.1 kpri_koperasi_prod | gzip > $FILENAME

# Hapus backup yang lebih tua dari 30 hari
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```
Berikan izin eksekusi: `chmod +x /home/kpri-mtsn3padang/backups/backup_db.sh`  
Tambahkan ke crontab harian jam 02:00 WIB:
```cron
0 2 * * * /home/kpri-mtsn3padang/backups/backup_db.sh
```

### 4.2 Restorasi Database (Restore)
Jika ingin memulihkan database dari file backup:
```bash
gunzip -c /home/kpri-mtsn3padang/backups/db_koperasi_YYYYMMDD_HHMMSS.sql.gz | psql -U kpri_db_user -h 127.0.0.1 -d kpri_koperasi_prod
```

---

## 🔄 5. Strategi Rollback Emergency (Bila Deploy Bermasalah)

Jika terjadi masalah kritis setelah deployment:

1. **Kembalikan Git Commit ke Commit Sebelumnya:**
   ```bash
   cd /home/kpri-mtsn3padang/htdocs/kpri.mtsn3padang.sch.id
   git reset --hard HEAD~1
   ```
2. **Build Ulang Asset & Clear Cache:**
   ```bash
   composer install --no-dev --optimize-autoloader
   npm ci
   npm run build
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan queue:restart
   ```

---

## 🧪 6. Checklist Verifikasi Pascadeploy (Smoke Test)

Setelah deployment selesai, lakukan pemeriksaan cepat berikut:

- [ ] **Akses URL Domain:** Buka [https://kpri.mtsn3padang.sch.id](https://kpri.mtsn3padang.sch.id) di browser dan pastikan HTTPS SSL aktif.
- [ ] **Login Pengurus & Anggota:** Uji coba masuk dengan akun admin & anggota.
- [ ] **Simulasi Pinjaman:** Buka menu pengajuan pinjaman dan pastikan potongan Dana Risiko (0,5%) dan Simpanan Wajib (0,5%) tampil dengan akurat.
- [ ] **Cek Log Error:** Periksa file log di `storage/logs/laravel.log` untuk memastikan tidak ada unhandled exception.
- [ ] **Status Queue Worker:** Pastikan worker aktif dengan perintah `sudo supervisorctl status`.
