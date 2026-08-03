# 🕌 Salam - Sistem Aplikasi Laporan Anak Mengaji

**Salam** adalah Progressive Web App (PWA) untuk sistem laporan & monitoring kehadiran anak mengaji secara real-time, dilengkapi notifikasi push yang **kuat & persistent**.

![Salam Icon](icons/icon-192x192.png)

## ✨ Fitur Utama

- 📱 **Progressive Web App (PWA)** - Bisa di-install di HP seperti aplikasi native (Android/iOS/Desktop)
- 🔔 **Notifikasi Kuat & Tidak Bisa Distop Otomatis** - `requireInteraction: true`, `renotify: true`
- 🌙 **Background Sync + Periodic Sync** - Cek update otomatis walau aplikasi ditutup
- 💤 **Wake Lock API** - Cegah HP sleep saat aplikasi aktif
- 📷 **QR Scanner** - Scan kartu identitas untuk tarik data anak
- 🗂️ **Offline Support** - Service Worker cache untuk offline-first
- 🔊 **Text-to-Speech (TTS)** - Suara laporan otomatis Bahasa Indonesia
- 📊 **Rekap Absensi & Nilai Evaluasi** - Real-time dari database cloud
- 🎨 **Icon Custom** - Icon Islamic family kartun (dari upload user)

## 🚀 Cara Hosting di GitHub Pages

1. **Buat repository baru** di GitHub (contoh: `salam-app`)
2. **Upload semua file** dari ZIP ini ke repository (di root, JANGAN dalam folder)
3. **Aktifkan GitHub Pages**:
   - Buka repository → **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** / **master**, Folder: **/ (root)**
   - Klik **Save**
4. **Tunggu 1-2 menit**, aplikasi akan tersedia di:
   ```
   https://USERNAME.github.io/salam-app/
   ```
5. **Buka URL di HP** → Chrome akan menampilkan banner "Install Salam" → klik Install

## 📂 Struktur File

```
salam-app/
├── index.html              # Aplikasi utama (dengan PWA & notifikasi kuat)
├── manifest.json           # PWA Manifest
├── sw.js                   # Service Worker (push + background sync)
├── favicon.ico             # Favicon
├── README.md               # Dokumentasi
├── .nojekyll               # Bypass Jekyll di GitHub Pages
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-180x180.png
    ├── icon-192x192.png
    ├── icon-256x256.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── maskable-192x192.png
    └── maskable-512x512.png
```

## 🔔 Kenapa Notifikasi Kuat & "Tidak Bisa Distop"?

Beberapa teknik yang digunakan agar notifikasi Salam sangat persistent:

| Teknik | Fungsi |
|--------|--------|
| `requireInteraction: true` | Notifikasi tetap tampil sampai user tap/tutup manual |
| `renotify: true` | Update notifikasi tetap bunyi walau tag sama |
| Vibrate pattern panjang | `[300,100,300,100,300,100,500]` — getar kuat |
| Push Actions | Tombol "Buka Aplikasi" & "Tutup" langsung di notifikasi |
| Periodic Background Sync | SW cek update tiap 15 menit walau app tertutup |
| Background Sync API | Retry otomatis jika offline |
| Wake Lock API | HP tidak sleep saat aplikasi aktif |
| Heartbeat 30 detik | Client → SW keep-alive |
| Banner reminder | Kalau user block notifikasi, banner merah persistent muncul |
| Service Worker `activate` + `skipWaiting` | SW langsung aktif tanpa perlu refresh |

## ⚠️ Catatan Penting

- **HTTPS wajib** - PWA & Notification API hanya jalan di HTTPS (GitHub Pages sudah otomatis HTTPS ✅)
- **Notifikasi bergantung izin user** - Browser modern (Chrome/Edge/Safari) tetap punya kontrol final. Tidak ada teknologi web yang benar-benar "tidak bisa distop" oleh sistem operasi, tapi kombinasi teknik di atas membuatnya **sangat sulit terlewat**.
- **iOS Safari 16.4+** - Push notification support di iOS baru mulai versi 16.4 (Maret 2023), dan hanya bekerja jika PWA sudah di-install ke home screen.
- **Battery Optimization Android** - Sarankan user untuk mematikan battery optimization di setting Android untuk aplikasi ini (Chrome/PWA), agar Periodic Sync tidak dibunuh sistem.

## 🛠️ Testing Notifikasi

Setelah install, buka Console browser (F12) di aplikasi & jalankan:

```javascript
navigator.serviceWorker.controller.postMessage({
  type: 'SHOW_NOTIFICATION',
  payload: {
    title: '🕌 Test Salam',
    body: 'Notifikasi test - kuat & persistent!',
    requireInteraction: true,
    vibrate: [500, 200, 500]
  }
});
```

## 📝 Lisensi

MIT License - Bebas digunakan untuk keperluan pondok pesantren, TPQ, madrasah, sekolah, dan lembaga pendidikan Islam lainnya.

---

**Dibuat dengan ❤️ untuk kemajuan pendidikan Islam** 🕌
