import './style.css';
import { Application, Graphics } from 'pixi.js';
import CanvasKitInit from 'canvaskit-wasm';
import canvaskitWasm from 'canvaskit-wasm/bin/canvaskit.wasm?url';

async function initPixi(container) {
  const app = new Application();
  await app.init({
    width: 400,
    height: 300,
    background: '#2d2d44',
  });

  container.appendChild(app.canvas);

  const circle = new Graphics().circle(200, 150, 80).fill(0xee6c4d);
  app.stage.addChild(circle);

  return app;
}

async function initSkia(canvas) {
  const CanvasKit = await CanvasKitInit({
    locateFile: () => canvaskitWasm,
  });

  const surface = CanvasKit.MakeCanvasSurface(canvas);
  if (!surface) {
    throw new Error('Failed to create CanvasKit surface');
  }

  const paint = new CanvasKit.Paint();
  paint.setColor(CanvasKit.Color(76, 175, 80, 1.0));
  paint.setStyle(CanvasKit.PaintStyle.Fill);
  paint.setAntiAlias(true);

  surface.drawOnce((skCanvas) => {
    skCanvas.clear(CanvasKit.Color(45, 45, 68, 1.0));
    skCanvas.drawCircle(200, 150, 80, paint);
  });

  paint.delete();
}

async function main() {
  await Promise.all([
    initPixi(document.getElementById('pixi-container')),
    initSkia(document.getElementById('skia-canvas')),
  ]);
}

main();
