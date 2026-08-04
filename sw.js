/* ================================================================
   SALAM PWA - Service Worker (Notifikasi Kuat & Persisten)
   ================================================================ */

const CACHE_NAME = 'salam-pwa-v1.0.0';
const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-72.png',
  './icon-96.png',
  './icon-128.png',
  './icon-144.png',
  './icon-152.png',
  './icon-192.png',
  './icon-384.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/html5-qrcode'
];

/* ---------------- INSTALL ---------------- */
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS.map(u => new Request(u, { cache: 'reload' })))
        .catch(err => console.log('[SW] Cache warmup partial:', err));
    })
  );
});

/* ---------------- ACTIVATE ---------------- */
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))),
      self.clients.claim()
    ])
  );
});

/* ---------------- FETCH (Cache-first, network fallback) ---------------- */
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Never cache API cloud calls (Supabase REST)
  if (req.url.includes('/rest/v1/')) return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

/* ---------------- BACKGROUND SYNC ---------------- */
self.addEventListener('sync', event => {
  if (event.tag === 'salam-sync-absensi') {
    event.waitUntil(cekAbsensiBackground());
  }
});

/* ---------------- PERIODIC BACKGROUND SYNC ---------------- */
self.addEventListener('periodicsync', event => {
  if (event.tag === 'salam-periodic-check') {
    event.waitUntil(cekAbsensiBackground());
  }
});

/* ---------------- PUSH NOTIFICATION ---------------- */
self.addEventListener('push', event => {
  let payload = { title: 'Salam - Info Kehadiran', body: 'Ada update baru untuk anak Anda.' };
  try { if (event.data) payload = event.data.json(); } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Salam', {
      body: payload.body || 'Ada update kehadiran anak Anda.',
      icon: 'icon-192.png',
      badge: 'icon-96.png',
      vibrate: [300, 100, 300, 100, 300, 100, 500],
      tag: 'salam-notif-' + Date.now(),
      renotify: true,
      requireInteraction: true,
      silent: false,
      data: { url: './index.html', time: Date.now() },
      actions: [
        { action: 'open', title: 'Buka Aplikasi' },
        { action: 'close', title: 'Tutup' }
      ]
    })
  );
});

/* ---------------- NOTIFICATION CLICK ---------------- */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'close') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('index.html') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});

/* ---------------- MESSAGE (dari page) ---------------- */
self.addEventListener('message', event => {
  if (!event.data) return;
  const d = event.data;

  if (d.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(d.title || 'Salam', {
      body: d.body || '',
      icon: 'icon-192.png',
      badge: 'icon-96.png',
      vibrate: [300, 100, 300, 100, 300],
      tag: 'salam-push-' + Date.now(),
      renotify: true,
      requireInteraction: true,
      silent: false,
      data: { url: './index.html' }
    });
  }

  if (d.type === 'SAVE_CONFIG') {
    self.salamConfig = { u: d.u, k: d.k, nis: d.nis, lastCount: d.lastCount || 0 };
  }

  if (d.type === 'SKIP_WAITING') self.skipWaiting();
});

/* ---------------- POLLING BACKGROUND (Fallback tanpa Push server) ---------------- */
async function cekAbsensiBackground() {
  try {
    const cfg = self.salamConfig;
    if (!cfg || !cfg.u || !cfg.k || !cfg.nis) return;

    const res = await fetch(`${cfg.u}/rest/v1/backup_lms?id=eq.1&select=*`, {
      headers: { 'apikey': cfg.k, 'Authorization': `Bearer ${cfg.k}` }
    });
    const data = await res.json();
    if (!data || !data.length) return;

    const db = data[0].data_json || {};
    const list = db.absensi || [];

    if (list.length > (cfg.lastCount || 0)) {
      const sesi = list[list.length - 1];
      const rec = (sesi.detail || []).find(d => String(d.nis) === String(cfg.nis));
      if (rec) {
        let body = `Anak Anda: ${rec.status} pada ${sesi.mapel} (${sesi.tanggal})`;
        await self.registration.showNotification('Salam - Update Kehadiran', {
          body,
          icon: 'icon-192.png',
          badge: 'icon-96.png',
          vibrate: [300, 100, 300, 100, 500],
          tag: 'salam-bg-' + Date.now(),
          renotify: true,
          requireInteraction: true
        });
      }
      cfg.lastCount = list.length;
      self.salamConfig = cfg;
    }
  } catch (e) {
    console.log('[SW] background check err:', e);
  }
}

/* ---------------- SELF-HEARTBEAT (paksa aktif) ---------------- */
setInterval(() => {
  cekAbsensiBackground();
}, 60000);
