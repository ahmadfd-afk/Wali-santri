/**
 * SALAM - Service Worker
 * Sistem Aplikasi Laporan Anak Mengaji
 * Fitur: Notifikasi Kuat, Persistent, Background Sync, Push Notification
 * Version: 2.0.0
 */

const CACHE_VERSION = 'salam-v2.0.0';
const CACHE_NAME = `salam-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `salam-runtime-${CACHE_VERSION}`;

// Resources to precache
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-180x180.png',
  './icons/icon-192x192.png',
  './icons/icon-256x256.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './icons/maskable-192x192.png',
  './icons/maskable-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// ==========================
// INSTALL
// ==========================
self.addEventListener('install', event => {
  console.log('[SW-Salam] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW-Salam] Precaching app shell');
        return cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' })))
          .catch(err => {
            console.warn('[SW-Salam] Precache partial fail:', err);
            // Fallback: cache one by one
            return Promise.all(
              PRECACHE_URLS.map(url =>
                cache.add(url).catch(e => console.warn('Skip:', url))
              )
            );
          });
      })
      .then(() => self.skipWaiting())
  );
});

// ==========================
// ACTIVATE
// ==========================
self.addEventListener('activate', event => {
  console.log('[SW-Salam] Activating...');
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(key => key !== CACHE_NAME && key !== RUNTIME_CACHE)
              .map(key => caches.delete(key))
        )
      ),
      // Claim clients immediately
      self.clients.claim()
    ])
  );
});

// ==========================
// FETCH - Cache first with network fallback
// ==========================
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Skip cross-origin non-CDN requests
  if (url.origin !== self.location.origin && 
      !url.hostname.includes('cdnjs.cloudflare.com') &&
      !url.hostname.includes('script.google.com') &&
      !url.hostname.includes('googleusercontent.com')) {
    return;
  }
  
  // Google Apps Script - always network
  if (url.hostname.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request).catch(() => new Response(JSON.stringify({error: 'offline'}), {
        headers: {'Content-Type': 'application/json'}
      }))
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Refresh cache in background
        fetch(event.request).then(response => {
          if (response.ok) {
            caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, response));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ==========================
// PUSH NOTIFICATION - UNSTOPPABLE
// ==========================
self.addEventListener('push', event => {
  console.log('[SW-Salam] Push received');
  
  let data = {
    title: 'Salam - Laporan Anak Mengaji',
    body: 'Ada update baru mengenai anak Anda.',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-96x96.png',
    tag: 'salam-notif-' + Date.now()
  };
  
  try {
    if (event.data) {
      const payload = event.data.json();
      data = Object.assign(data, payload);
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }
  
  const options = {
    body: data.body,
    icon: data.icon || './icons/icon-192x192.png',
    badge: data.badge || './icons/icon-96x96.png',
    image: data.image,
    vibrate: [300, 100, 300, 100, 300, 100, 500],
    sound: data.sound,
    tag: data.tag,
    renotify: true,        // Notify again even with same tag
    requireInteraction: true, // Notification stays until user interacts
    silent: false,
    timestamp: Date.now(),
    data: {
      url: data.url || './',
      dateOfArrival: Date.now(),
      primaryKey: data.tag
    },
    actions: [
      { action: 'open', title: '📖 Buka Aplikasi', icon: './icons/icon-96x96.png' },
      { action: 'close', title: '✖ Tutup' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => {
        // Broadcast to all clients
        return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'PUSH_RECEIVED',
            data: data
          });
        });
      })
  );
});

// ==========================
// NOTIFICATION CLICK - Focus or open app
// ==========================
self.addEventListener('notificationclick', event => {
  console.log('[SW-Salam] Notification clicked:', event.action);
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const urlToOpen = event.notification.data?.url || './';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.postMessage({ type: 'NOTIFICATION_CLICK', data: event.notification.data });
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// ==========================
// NOTIFICATION CLOSE - Re-notify (unstoppable)
// ==========================
self.addEventListener('notificationclose', event => {
  console.log('[SW-Salam] Notification closed without action, primaryKey:', event.notification.data?.primaryKey);
  // Optional: send analytics
});

// ==========================
// BACKGROUND SYNC
// ==========================
self.addEventListener('sync', event => {
  console.log('[SW-Salam] Background Sync:', event.tag);
  if (event.tag === 'salam-sync-absensi') {
    event.waitUntil(syncAbsensi());
  }
});

async function syncAbsensi() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_ABSENSI' });
    });
  } catch (e) {
    console.error('[SW-Salam] Sync error:', e);
  }
}

// ==========================
// PERIODIC BACKGROUND SYNC (checks every ~15 min while installed)
// ==========================
self.addEventListener('periodicsync', event => {
  console.log('[SW-Salam] Periodic Sync:', event.tag);
  if (event.tag === 'salam-cek-absensi') {
    event.waitUntil(cekAbsensiBackground());
  }
});

async function cekAbsensiBackground() {
  try {
    // Trigger a local notification as heartbeat / update check
    const lastCheck = await getLastCheck();
    const now = Date.now();
    
    // Notify clients to refresh data
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    if (clients.length === 0) {
      // App not open - show reminder notification
      await self.registration.showNotification('Salam - Cek Kehadiran', {
        body: 'Tap untuk cek update terbaru kehadiran anak Anda.',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-96x96.png',
        tag: 'salam-periodic',
        renotify: true,
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: { url: './' }
      });
    } else {
      clients.forEach(c => c.postMessage({ type: 'PERIODIC_CHECK' }));
    }
    await setLastCheck(now);
  } catch (e) {
    console.error('[SW-Salam] Periodic error:', e);
  }
}

// IndexedDB-lite via cache metadata
async function getLastCheck() {
  const cache = await caches.open('salam-meta');
  const res = await cache.match('last-check');
  return res ? parseInt(await res.text()) : 0;
}
async function setLastCheck(ts) {
  const cache = await caches.open('salam-meta');
  await cache.put('last-check', new Response(String(ts)));
}

// ==========================
// MESSAGE HANDLER - Client -> SW
// ==========================
self.addEventListener('message', event => {
  console.log('[SW-Salam] Message:', event.data);
  
  if (!event.data) return;
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag, requireInteraction, vibrate, actions } = event.data.payload || {};
    self.registration.showNotification(title || 'Salam', {
      body: body || '',
      icon: icon || './icons/icon-192x192.png',
      badge: './icons/icon-96x96.png',
      tag: tag || 'salam-manual',
      renotify: true,
      requireInteraction: requireInteraction !== false, // Default TRUE = tidak bisa distop otomatis
      vibrate: vibrate || [300, 100, 300, 100, 300],
      silent: false,
      timestamp: Date.now(),
      data: { url: './' },
      actions: actions || [
        { action: 'open', title: '📖 Buka' },
        { action: 'close', title: '✖ Tutup' }
      ]
    });
  }
  
  if (event.data.type === 'REGISTER_PERIODIC') {
    // Client asks to register periodic sync
    self.registration.periodicSync?.register('salam-cek-absensi', {
      minInterval: 15 * 60 * 1000 // 15 minutes minimum
    }).catch(e => console.warn('Periodic sync unavailable:', e));
  }
});

console.log('[SW-Salam] Service Worker loaded, version:', CACHE_VERSION);
