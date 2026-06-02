import { defineConfig, type Plugin } from 'vite';

const env = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env;

const base = env?.GITHUB_ACTIONS ? '/SBoardTestTask/' : '/';

const CACHE_VERSION = 'v1';

/** Preload Pixi (lib) and app chunks in parallel with the entry script. */
function injectCriticalModulePreloads(): Plugin {
  return {
    name: 'inject-critical-module-preloads',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) {
          return html;
        }

        const links: string[] = [];

        for (const chunk of Object.values(bundle)) {
          if (chunk.type !== 'chunk') {
            continue;
          }

          const fileName = chunk.fileName;
          if (!/\/(lib-|app-|pixi-)[^/]+\.js$/.test(fileName)) {
            continue;
          }

          const href = `${base}${fileName}`.replace(/\/{2,}/g, '/');
          links.push(`<link rel="modulepreload" crossorigin href="${href}">`);
        }

        if (links.length === 0) {
          return html;
        }

        return html.replace('</head>', `  ${links.join('\n  ')}\n</head>`);
      },
    },
  };
}

function emitServiceWorker(): Plugin {
  return {
    name: 'emit-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const assetUrls = new Set<string>();

      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk' || file.type === 'asset') {
          const normalizedBase = base.endsWith('/') ? base : `${base}/`;
          assetUrls.add(`${normalizedBase}${file.fileName}`.replace(/\/{2,}/g, '/'));
        }
      }

      const urls = [...assetUrls].sort();
      const cacheName = `sboard-static-${CACHE_VERSION}`;

      const source = `const CACHE = ${JSON.stringify(cacheName)};
const PRECACHE = ${JSON.stringify(urls)};

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
`;

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source,
      });
    },
  };
}

export default defineConfig({
  base,
  assetsInclude: ['**/*.wasm'],
  plugins: [injectCriticalModulePreloads(), emitServiceWorker()],
  build: {
    target: 'es2020',
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/pixi.js-legacy') || id.includes('node_modules/@pixi')) {
            return 'pixi';
          }

          if (
            id.includes('canvaskit-wasm-pdf')
            || id.includes('@rollerbird/canvaskit-wasm-pdf')
            || (id.includes('/skia/pdf/') && !id.endsWith('.ts'))
          ) {
            return 'pdf';
          }
        },
      },
    },
  },
});
