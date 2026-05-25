# Сборка CanvasKit с PDF backend

Стандартный пакет `canvaskit-wasm` из npm **не включает** Skia PDF (`skia_enable_pdf=false`).

В проекте используется готовая сборка `@rollerbird/canvaskit-wasm-pdf` (лежит в `deps/rollerbird-canvaskit-wasm-pdf-0.1.3.tgz`).

## Пересборка из исходников Skia

1. Linux или WSL2 / Docker (на Windows нативно не собирается).
2. [depot_tools](https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html)
3. [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html)

```bash
chmod +x scripts/build-canvaskit-pdf.sh
./scripts/build-canvaskit-pdf.sh
```

Скрипт выставляет `skia_enable_pdf=true` и собирает `modules/canvaskit`.

После сборки:

```bash
npm install file:deps/<полученный-tarball>.tgz
```

## API в приложении

- Превью: `canvaskit-wasm` (меньший размер)
- PDF: `loadCanvasKitPdf()` → `MakePDFDocument` → `beginPage` → тот же `PixiSceneDrawer` → `close()` → векторный PDF
