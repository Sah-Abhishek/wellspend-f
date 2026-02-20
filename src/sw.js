import { precacheAndRoute } from 'workbox-precaching';

// Precache all assets built by Vite
precacheAndRoute(self.__WB_MANIFEST);

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'WellSpend', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'WellSpend', {
      body: payload.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: payload.url || '/app' },
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/app';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Reuse an existing tab if possible
      for (const client of clients) {
        if (new URL(client.url).pathname === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      return self.clients.openWindow(targetUrl);
    })
  );
});
