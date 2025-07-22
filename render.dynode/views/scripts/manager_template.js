window.swManager = {
  async register() {
    if ("serviceWorker" in navigator)
      try {
        const n = await navigator.serviceWorker.register(
          `/dynamics/{{creativeId}}/assets.min.js`,
          {
            scope: "/dynamics/{{creativeId}}/",
            updateViaCache: "none",
          }
        );
        return (
          console.log("ServiceWorker registration successful"),
          await n.update(),
          setInterval(() => {
            n.update();
          }, 36e5),
          n
        );
      } catch (n) {
        console.error("ServiceWorker registration failed:", n);
        throw n;
      }
  },
  async unregister() {
    if ("serviceWorker" in navigator)
      try {
        const n = await navigator.serviceWorker.ready;
        n && n.active && n.active.postMessage({ action: "unregister" });
      } catch (n) {
        console.error("Unregister error", n);
      }
  },
  async clearCache() {
    if ("serviceWorker" in navigator)
      try {
        const n = await navigator.serviceWorker.ready;
        n && n.active && n.active.postMessage({ action: "clearCache" });
      } catch (n) {
        console.error("Clear cache error", n);
      }
  },
  async skipCache(n) {
    if ("serviceWorker" in navigator)
      try {
        const t = await navigator.serviceWorker.ready;
        t && t.active && t.active.postMessage({ action: "skipCache", url: n });
      } catch (t) {
        console.error("Skip cache error", t);
      }
  },
};
window.addEventListener("creative-ready", async function (n) {
  const t = n.detail.creativeId;
  if (t && "serviceWorker" in navigator)
    try {
      await window.swManager.register(t);
    } catch (i) {
      console.error("ServiceWorker registration failed:", i);
    }
});
window.dispatchEvent(
  new CustomEvent("creative-ready", {
    detail: { creativeId: "{{creativeId}}" },
  })
);
