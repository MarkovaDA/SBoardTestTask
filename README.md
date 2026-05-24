# SBoard Test Task

Веб-проект по мотивам тестового задания:
https://docs.google.com/document/d/1RKVCzOrDry7oCpri5HKzLpWlmH35ddcB2_SV9Y1zjf0/edit?tab=t.0


## Стек

- [Pixi.js](https://pixijs.com/) — WebGL/WebGPU-рендеринг
- [canvaskit-wasm](https://www.npmjs.com/package/canvaskit-wasm) — Skia, скомпилированная в WebAssembly для браузера
- [Vite](https://vite.dev/) — сборка и dev-сервер

## Требования

- Node.js 18+
- npm

## Установка

```bash
npm install
```

## Запуск

```bash
# dev-сервер (http://localhost:5173)
npm start

# или
npm run dev
```

## Сборка

```bash
# production-сборка в папку dist/
npm run build

# просмотр production-сборки
npm run preview
```

## Структура проекта

```
├── index.html          # точка входа HTML
├── src/
│   ├── main.js         # инициализация Pixi.js и CanvasKit
│   └── style.css       # базовые стили
├── vite.config.js      # конфигурация Vite (поддержка .wasm)
└── package.json
```

## Что на странице

На главной странице два canvas:

- **Pixi.js** — оранжевый круг, нарисованный через WebGL
- **Skia (CanvasKit)** — зелёный круг, нарисованный через Skia WASM

## Лицензия

ISC
