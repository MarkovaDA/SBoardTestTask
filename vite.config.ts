import { defineConfig } from 'vite';

const env = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env;

export default defineConfig({
  base: env?.GITHUB_ACTIONS ? '/SBoardTestTask/' : '/',
  assetsInclude: ['**/*.wasm'],
});
