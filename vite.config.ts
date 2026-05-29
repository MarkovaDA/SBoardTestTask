import { defineConfig, type Plugin } from 'vite';

const env = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env;

const base = env?.GITHUB_ACTIONS ? '/SBoardTestTask/' : '/';

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
          if (!/\/(lib-|app-)[^/]+\.js$/.test(fileName)) {
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

export default defineConfig({
  base,
  assetsInclude: ['**/*.wasm'],
  plugins: [injectCriticalModulePreloads()],
});
