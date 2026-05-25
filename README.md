# SBoard Test Task

Веб-приложение на TypeScript: Pixi.js + Skia (CanvasKit), обёртка рендера Pixi-контейнера в Skia и **векторный** экспорт в PDF через Skia PDF backend.

## Стек

- [Pixi.js](https://pixijs.com/) — интерактивная сцена (WebGL)
- [canvaskit-wasm](https://www.npmjs.com/package/canvaskit-wasm) — превью Skia в браузере
- [@rollerbird/canvaskit-wasm-pdf](deps/rollerbird-canvaskit-wasm-pdf-0.1.3.tgz) — CanvasKit со `skia_enable_pdf=true`
- [Vite](https://vite.dev/) + TypeScript

## Требования

- Node.js 18+
- npm

## Установка и запуск

```bash
npm install
npm start          # http://localhost:5173
npm run typecheck
npm run build
```

## Интерфейс

- **Pixi.js** — исходная сцена (демо из ТЗ + случайные фигуры)
- **Skia** — тот же `PIXI.Container` через `convertPixiContainerToSkia()`
- **ControlPanel**
  - «Экспорт в PDF» — векторный PDF через `MakePDFDocument` / `beginPage` / `close`
  - «Сгенерировать случайную линию / фигуру»

## Архитектура

```
src/skia/
├── types.ts                 # общие типы (опции рендера + CanvasKit API)
├── pixi/                    # Pixi.js → Skia
│   ├── types.ts             # ISkiaRenderer, SkiaRenderTarget
│   └── ...
└── pdf/                     # экспорт в PDF
```

Экспорт рисует те же примитивы, что и превью (`drawPath`, заливки, линии) — **не** растровая вставка в PDF.

## Пересборка WASM с PDF

См. [scripts/build-canvaskit-pdf.md](scripts/build-canvaskit-pdf.md) и `scripts/build-canvaskit-pdf.sh` (Linux/WSL, `skia_enable_pdf=true`).

## Лицензия

ISC
