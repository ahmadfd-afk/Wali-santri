# Salam - Sistem Aplikasi Laporan Anak Mengaji

PWA (Progressive Web App) untuk monitoring & laporan kehadiran anak mengaji secara real-time bagi wali/orang tua.

## 🚀 Cara Hosting di GitHub Pages

1. **Buat repository baru** di GitHub (misal: `salam-pwa`).
2. **Upload SEMUA file** dalam folder ini ke root repository (tanpa subfolder).
3. Buka **Settings → Pages**.
4. Pada **Source** pilih branch `main` (atau `master`) dan folder `/ (root)`.
5. Klik **Save**. Tunggu ~1 menit.
6. Aplikasi akan tersedia di:
   `https://<username>.github.io/salam-pwa/`

> ⚠️ **PENTING**: PWA HARUS diakses melalui HTTPS. GitHub Pages sudah otomatis HTTPS, jadi aman.

## 📱 Cara Install PWA di HP

### Android (Chrome):
1. Buka URL GitHub Pages di Chrome.
2. Muncul banner **"Install Salam"** → klik **Install**.
3. Atau: menu ⋮ → **Add to Home screen**.
4. Aplikasi akan muncul di layar utama seperti app native.

### iPhone (Safari):
1. Buka URL di Safari.
2. Tekan tombol **Share** (kotak dengan panah ke atas).
3. Pilih **Add to Home Screen**.

## 🔔 Notifikasi Kuat & Sulit Distop

Aplikasi ini dilengkapi dengan:
- ✅ **Push Notification** dengan `requireInteraction: true` (notifikasi tidak hilang otomatis)
- ✅ **Vibrasi kuat** dengan pola berulang
- ✅ **Text-to-Speech (TTS)** dalam Bahasa Indonesia
- ✅ **Wake Lock API** — mencegah HP tidur agresif
- ✅ **Periodic Background Sync** (Chrome) — cek data tiap menit di background
- ✅ **Service Worker heartbeat** — polling data terus menerus
- ✅ **Keep-alive interval** — SW tetap hidup
- ✅ **Notifikasi persisten** — tetap muncul walau app ditutup
- ✅ **Icon, badge, image, dan actions** notifikasi lengkap

## 📂 Struktur File (SEMUA DALAM 1 FOLDER)

```
index.html               → Halaman utama aplikasi
manifest.json            → Manifest PWA
sw.js                    → Service Worker (notifikasi background)
icon-72.png              → Icon 72px
icon-96.png              → Icon 96px
icon-128.png             → Icon 128px
icon-144.png             → Icon 144px
icon-152.png             → Icon 152px
icon-192.png             → Icon 192px (utama)
icon-384.png             → Icon 384px
icon-512.png             → Icon 512px (splash screen)
icon-maskable-192.png    → Icon adaptif Android
icon-maskable-512.png    → Icon adaptif Android besar
apple-touch-icon.png     → Icon untuk iOS
favicon.png              → Favicon browser
README.md                → Panduan ini
```

## ⚙️ Tips Agar Notifikasi Maksimal

Setelah install PWA di HP:
1. Buka **Settings HP → Apps → Salam** (atau "Chrome" untuk Android).
2. **Nonaktifkan Battery Optimization** untuk aplikasi Salam.
3. **Izinkan Notifikasi** (Allow all).
4. **Izinkan Background Data**.
5. Untuk **Xiaomi/Oppo/Vivo**: Aktifkan **Autostart** dan **Lock in recent apps**.

## 🔧 Kustomisasi

- Warna tema: edit `--primary: #04432A` dan `--accent: #D4AF37` di `index.html`.
- Nama aplikasi: edit `name` dan `short_name` di `manifest.json`.
- Icon: replace file `icon-*.png` dengan icon Anda (ukuran harus sama).

## 📄 Lisensi

Free untuk digunakan pribadi dan komersial.

---
**Salam** — Sistem Aplikasi Laporan Anak Mengaji 📖
