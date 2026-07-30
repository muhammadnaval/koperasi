# Panduan Deployment CloudPanel & GitHub Actions

Dokumen ini berisi langkah-langkah instalasi dan alur CI/CD otomatis untuk aplikasi **Koperasi Simpan Pinjam KPRI MTsN 3 Kota Padang** pada domain produksi [https://kpri.mtsn3padang.sch.id](https://kpri.mtsn3padang.sch.id).

---

## 1. Spesifikasi Server Produksi (CloudPanel)
- **Domain Produksi:** `kpri.mtsn3padang.sch.id`
- **PHP Version:** PHP 8.5 (FPM)
- **Database:** PostgreSQL 18
- **Document Root:** `/home/kpri-mtsn3padang/htdocs/kpri.mtsn3padang.sch.id/public`
- **Web Server:** Nginx Reverse Proxy + SSL Let's Encrypt

---

## 2. Pengaturan GitHub Repository Secrets
Buka repository GitHub Anda di `https://github.com/muhammadnaval/koperasi/settings/secrets/actions` dan tambahkan **Repository Secrets** berikut:

| Nama Secret | Deskripsi / Nilai |
|---|---|
| `SSH_HOST` | IP Address atau Hostname VPS CloudPanel Anda |
| `SSH_USER` | Username SSH (misal: `kpri-mtsn3padang` atau `root`) |
| `SSH_KEY` | Private SSH Key (RSA/Ed25519) untuk login tanpa password |
| `SSH_PORT` | Port SSH server (default: `22`) |
| `TARGET_DIR` | Directory proyek di server (default: `/home/kpri-mtsn3padang/htdocs/kpri.mtsn3padang.sch.id`) |

---

## 3. Langkah Instalasi Awal di Server CloudPanel (First Time Setup)

1. **Clone Repository di Server:**
   ```bash
   cd /home/kpri-mtsn3padang/htdocs
   git clone https://github.com/muhammadnaval/koperasi.git kpri.mtsn3padang.sch.id
   cd kpri.mtsn3padang.sch.id
   ```

2. **Salin & Konfigurasi File Environment Produksi:**
   ```bash
   cp .env.production.example .env
   php artisan key:generate
   ```
   Edit `.env` di server dan masukkan kredensial PostgreSQL produksi Anda.

3. **Install Dependencies & Build Aset:**
   ```bash
   composer install --no-dev --optimize-autoloader
   npm ci
   npm run build
   ```

4. **Jalankan Migrasi Database & Seeder Awal:**
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   ```

5. **Optimasi Cache Laravel:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan event:cache
   ```

6. **Konfigurasi Cron Job (Laravel Scheduler):**
   Tambahkan baris berikut pada crontab user server (`crontab -e`):
   ```bash
   * * * * * cd /home/kpri-mtsn3padang/htdocs/kpri.mtsn3padang.sch.id && php artisan schedule:run >> /dev/null 2>&1
   ```

---

## 4. Alur Deployment Otomatis (CI/CD)
Setiap kali Anda melakukan `git push origin main`, GitHub Actions workflow (`.github/workflows/deploy.yml`) akan:
1. Memeriksa kualitas kode dengan Pint linting & Pest/PHPUnit tests.
2. Membangun aset Vite produksi.
3. Terhubung secara aman via SSH ke server CloudPanel untuk memperbarui kode (`git pull`), menjalankan migrasi database, dan mengoptimasi cache.
