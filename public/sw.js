self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      data = { title: 'Notification', body: event.data.text() };
    }
  }
  const title = data.title || 'Notification';
  const options = {
    body: data.body || '',
    icon: '/logo192.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
