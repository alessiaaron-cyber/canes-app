const APP_URL = "/canes-rivalry-app/";

function normalizeUrl(url) {
  if (!url || url === "/") return APP_URL;
  return url;
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || "Canes Rivalry";
  const options = {
    body: data.body || data.message || "Rivalry update.",
    tag: data.tag || "canes-rivalry",
    data: { url: normalizeUrl(data.url) },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = normalizeUrl(event.notification.data?.url);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
