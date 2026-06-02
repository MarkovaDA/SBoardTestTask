const CACHE = "sboard-static-v1";
const PRECACHE = ["/SBoardTestTask/assets/app-CO2h9zOr.js","/SBoardTestTask/assets/canvaskit-pdf-DL6ptVpQ.wasm","/SBoardTestTask/assets/constants-BjyUWcmy.js","/SBoardTestTask/assets/demoScene-DitNL_Xl.js","/SBoardTestTask/assets/draggable-CJ4Kizny.js","/SBoardTestTask/assets/index-B7oRQK5z.css","/SBoardTestTask/assets/index-CUdkDXM2.js","/SBoardTestTask/assets/linesScene-Dl9bT69r.js","/SBoardTestTask/assets/pdf-D5PEKunZ.js","/SBoardTestTask/assets/pdf-E-yzXIs8.js","/SBoardTestTask/assets/pixi-B3-iXj9w.js","/SBoardTestTask/assets/randomShape-B-jE0aCo.js","/SBoardTestTask/assets/rolldown-runtime-QTnfLwEv.js","/SBoardTestTask/assets/shapesScene-CyEv-OuF.js","/SBoardTestTask/assets/strokeCommitter-BVQkEG07.js"];

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
