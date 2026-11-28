const C = "spda-v12", F = ["./", "index.html", "manifest.json", "icon.svg"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(F)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});
// Rede com limite de 3 s; se demorar ou falhar, usa o cache (sinal fraco no campo não trava o app)
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== self.location.origin) return; // fontes externas: não interceptar
  e.respondWith((async () => {
    const cache = await caches.open(C);
    const cached = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => {
      if (r && r.status === 200 && r.type === "basic") cache.put(e.request, r.clone());
      return r;
    });
    net.catch(() => {});
    if (!cached) {
      try { return await net; }
      catch (err) { return (await cache.match("./")) || (await cache.match("index.html")) || Response.error(); }
    }
    const timeout = new Promise(res => setTimeout(() => res(null), 3000));
    try {
      const r = await Promise.race([net, timeout]);
      return r || cached;
    } catch (err) {
      return cached;
    }
  })());
});
