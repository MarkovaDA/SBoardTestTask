import { Application, Container } from 'pixi.js';
import { loadCanvasKit } from '../skia/loadCanvasKit';
import { PixiToSkiaRenderer } from '../skia/pixiToSkiaRenderer';
import { createDemoScene } from '../scene/demoScene';
import { addRandomShape } from '../scene/randomShape';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;

export class App {
  private readonly _pixiApp: Application;
  private readonly sceneRoot: Container;
  private readonly skiaRenderer: PixiToSkiaRenderer;
  private readonly skiaCanvas: HTMLCanvasElement;

  private constructor(
    pixiApp: Application,
    sceneRoot: Container,
    skiaRenderer: PixiToSkiaRenderer,
    skiaCanvas: HTMLCanvasElement,
  ) {
    this._pixiApp = pixiApp;
    this.sceneRoot = sceneRoot;
    this.skiaRenderer = skiaRenderer;
    this.skiaCanvas = skiaCanvas;
  }

  static async create(): Promise<App> {
    const canvasKit = await loadCanvasKit();

    const pixiContainer = document.getElementById('pixi-container');
    const skiaCanvas = document.getElementById('skia-canvas');
    const randomBtn = document.getElementById('btn-random-shape');

    if (!pixiContainer || !(skiaCanvas instanceof HTMLCanvasElement)) {
      throw new Error('Required DOM elements not found');
    }
    if (!(randomBtn instanceof HTMLButtonElement)) {
      throw new Error('Control panel button not found');
    }

    const pixiApp = new Application();

    await pixiApp.init({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      background: '#2d2d44',
    });
    pixiContainer.appendChild(pixiApp.canvas);

    const sceneRoot = createDemoScene();
    pixiApp.stage.addChild(sceneRoot);

    const skiaRenderer = new PixiToSkiaRenderer(canvasKit, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      background: '#f5f5f5',
    });

    const app = new App(pixiApp, sceneRoot, skiaRenderer, skiaCanvas);

    randomBtn.addEventListener('click', () => {
      app.addRandomShape();
    });

    app.syncSkiaPreview();
    return app;
  }

  private syncSkiaPreview(): void {
    this._pixiApp.stage.updateTransform({});
    this.skiaRenderer.render(this.sceneRoot, {
      kind: 'html-canvas',
      canvas: this.skiaCanvas,
    });
  }

  private addRandomShape(): void {
    addRandomShape(this.sceneRoot);
    this.syncSkiaPreview();
  }
}
