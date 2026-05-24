import './style.css';
import { Application, Graphics } from 'pixi.js';
import CanvasKitInit from 'canvaskit-wasm';
import canvaskitWasm from 'canvaskit-wasm/bin/canvaskit.wasm?url';

async function initPixi(container: HTMLElement): Promise<Application> {
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

async function initSkia(canvas: HTMLCanvasElement): Promise<void> {
  const CanvasKit = await CanvasKitInit({
    locateFile: () => canvaskitWasm,
  });

  const surface = CanvasKit.MakeCanvasSurface(canvas);
  if (!surface) {
    throw new Error('Failed to create CanvasKit surface');
  }

  surface.drawOnce((skCanvas) => {
    const { width, height } = canvas;

    const backgroundPaint = new CanvasKit.Paint();
    const gradient = CanvasKit.Shader.MakeLinearGradient(
      [0, 0],
      [width, height],
      [
        CanvasKit.Color(72, 52, 212, 1.0),
        CanvasKit.Color(255, 94, 98, 1.0),
        CanvasKit.Color(255, 193, 7, 1.0),
      ],
      [0, 0.55, 1],
      CanvasKit.TileMode.Clamp,
    );
    backgroundPaint.setShader(gradient);
    skCanvas.drawRect(CanvasKit.LTRBRect(0, 0, width, height), backgroundPaint);
    gradient.delete();
    backgroundPaint.delete();

    const circlePaint = new CanvasKit.Paint();
    circlePaint.setColor(CanvasKit.Color(255, 255, 255, 0.35));
    circlePaint.setStyle(CanvasKit.PaintStyle.Fill);
    circlePaint.setAntiAlias(true);
    skCanvas.drawCircle(width * 0.5, height * 0.5, 80, circlePaint);
    circlePaint.delete();

    const accentPaint = new CanvasKit.Paint();
    accentPaint.setColor(CanvasKit.Color(76, 175, 80, 1.0));
    accentPaint.setStyle(CanvasKit.PaintStyle.Fill);
    accentPaint.setAntiAlias(true);
    skCanvas.drawCircle(width * 0.5, height * 0.5, 55, accentPaint);
    accentPaint.delete();
  });
}

async function main(): Promise<void> {
  const pixiContainer = document.getElementById('pixi-container');
  const skiaCanvas = document.getElementById('skia-canvas');

  if (!pixiContainer || !(skiaCanvas instanceof HTMLCanvasElement)) {
    throw new Error('Required DOM elements not found');
  }

  await Promise.all([initPixi(pixiContainer), initSkia(skiaCanvas)]);
}

main();
