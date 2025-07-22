const cacheName = "creative-assets-{{creativeId}}",
  filesToCache = ["{{filesToCache}}"],
  excludedUrls = ["{{filesToExclude}}"];
self.addEventListener("install", (n) => {
  n.waitUntil(
    caches
      .open(cacheName)
      .then((n) => n.addAll(filesToCache))
      .catch((n) => {
        console.error("Service Worker Install Error:", n);
      })
  );
});
self.addEventListener("fetch", (n) => {
  n.respondWith(
    caches
      .match(n.request)
      .then((t) =>
        t
          ? t
          : fetch(n.request)
              .then((t) => {
                if (t.ok) {
                  const i = t.clone();
                  caches
                    .open(cacheName)
                    .then((t) => {
                      t.put(n.request, i);
                    })
                    .catch((n) => {
                      console.error("Cache Put Error:", n);
                    });
                }
                return t;
              })
              .catch(
                (t) => (console.error("Fetch Error:", t), fetch(n.request))
              )
      )
      .catch((t) => (console.error("Cache Match Error:", t), fetch(n.request)))
  );
});
self.addEventListener("message", (n) => {
  n.data.action === "unregister"
    ? self.registration.unregister().then(() => {
        console.log("Service Worker unregistered.");
      })
    : n.data.action === "clearCache"
    ? caches.delete(cacheName).then(() => {
        console.log("Cache cleared.");
      })
    : n.data.action === "skipCache" &&
      console.log(`Skipping cache for: ${n.data.url}`);
});
