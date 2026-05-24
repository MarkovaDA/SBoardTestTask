# SBoard Test Task

Веб-приложение на TypeScript: Pixi.js + Skia (CanvasKit), обёртка рендера Pixi-контейнера в Skia.

## Стек

- [Pixi.js](https://pixijs.com/) — интерактивная сцена (WebGL)
- [canvaskit-wasm](https://www.npmjs.com/package/canvaskit-wasm) — Skia в браузере
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
- **Skia** — тот же `PIXI.Container`, отрисованный через `PixiToSkiaRenderer`
- **ControlPanel**
  - «Экспорт в PDF» — заглушка (будет на следующем этапе)
  - «Сгенерировать случайную линию / фигуру»

## Архитектура

```
src/
├── skia/
│   ├── types.ts              # ISkiaRenderer
│   └── pixiToSkiaRenderer.ts # Pixi Container → Skia canvas
├── scene/
│   ├── demoScene.ts          # псевдокод из ТЗ
│   └── randomShape.ts
└── app/App.ts
```

### `ISkiaRenderer` / `PixiToSkiaRenderer`

- На вход: `PIXI.Container`
- Рекурсивный обход `DisplayObject` с `translate` / `rotate` / `scale` (через `localTransform`)
- **Graphics**: `fill` / `stroke` из `graphics.context.instructions` → SVG path (`buildSVGPath`) → `SkPath`
- **Sprite**: PNG через `MakeImageFromCanvasImageSource`

## Лицензия

ISC
