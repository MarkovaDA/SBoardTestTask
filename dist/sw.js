const CACHE = "sboard-static-v1";
const PRECACHE = ["/assets/app-FWbaIAll.js","/assets/canvaskit-pdf-DL6ptVpQ.wasm","/assets/constants-BjyUWcmy.js","/assets/demoScene-COrTueP5.js","/assets/draggable-Di07rnBB.js","/assets/index-CrJcdEyc.js","/assets/index-D-dOu8lc.css","/assets/linesScene-BbkfgUMH.js","/assets/pdf-CFd5sywF.js","/assets/pdf-CiIxCHvq.js","/assets/pixi-BZzx2cVF.js","/assets/randomShape-WMDiD0kC.js","/assets/rolldown-runtime-QTnfLwEv.js","/assets/shapesScene-CQsJ0kW4.js","/assets/strokeCommitter-DaoZc73u.js"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('sboard-static-') && key !== CACHE)
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (!response.ok) {
          return response;
        }

        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      });
    }),
  );
});
