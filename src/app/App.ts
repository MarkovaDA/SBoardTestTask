import { Application, Container } from 'pixi.js';
import { getViewportCanvasSize } from './canvasLayout';
import { loadCanvasKit, PixiToSkiaRenderer } from '../skia/pixi';
import type { SkiaPdfExporter } from '../skia/pdf';
import type { SkiaRendererOptions } from '../skia/types';
import { createDemoScene } from '../scene/demoScene';
import { addRandomShape } from '../scene/randomShape';

const SCENE_BACKGROUND = '#2d2d44';

export class App {
  private readonly _pixiApp: Application;
  private readonly sceneRoot: Container;
  private readonly skiaRenderer: PixiToSkiaRenderer;
  private readonly skiaCanvas: HTMLCanvasElement;
  private readonly renderOptions: SkiaRendererOptions;
  private pdfExporter: SkiaPdfExporter | null = null;

  private constructor(
    pixiApp: Application,
    sceneRoot: Container,
    skiaRenderer: PixiToSkiaRenderer,
    skiaCanvas: HTMLCanvasElement,
    renderOptions: SkiaRendererOptions,
  ) {
    this._pixiApp = pixiApp;
    this.sceneRoot = sceneRoot;
    this.skiaRenderer = skiaRenderer;
    this.skiaCanvas = skiaCanvas;
    this.renderOptions = renderOptions;
  }

  static async create(): Promise<App> {
    const canvasKit = await loadCanvasKit();

    const pixiContainer = document.getElementById('pixi-container');
    const skiaCanvas = document.getElementById('skia-canvas');
    const exportBtn = document.getElementById('btn-export-pdf');
    const randomBtn = document.getElementById('btn-random-shape');

    if (!pixiContainer || !(skiaCanvas instanceof HTMLCanvasElement)) {
      throw new Error('Required DOM elements not found');
    }
    if (!(exportBtn instanceof HTMLButtonElement) || !(randomBtn instanceof HTMLButtonElement)) {
      throw new Error('Control panel buttons not found');
    }

    const { width, height } = getViewportCanvasSize();
    const renderOptions: SkiaRendererOptions = {
      width,
      height,
      background: SCENE_BACKGROUND,
    };

    const pixiApp = new Application();
    await pixiApp.init({
      width: renderOptions.width,
      height: renderOptions.height,
      background: SCENE_BACKGROUND,
      resolution: 1,
    });
    pixiContainer.appendChild(pixiApp.canvas);

    const sceneRoot = createDemoScene();
    pixiApp.stage.addChild(sceneRoot);

    const skiaRenderer = new PixiToSkiaRenderer(canvasKit, renderOptions);
    const app = new App(pixiApp, sceneRoot, skiaRenderer, skiaCanvas, renderOptions);

    exportBtn.addEventListener('click', () => {
      void app.exportPdf();
    });
    randomBtn.addEventListener('click', () => {
      app.addRandomShape();
    });

    app.applyCanvasSize();
    window.addEventListener('resize', () => app.applyCanvasSize());
    return app;
  }

  private applyCanvasSize(): void {
    const { width, height } = getViewportCanvasSize();
    this.renderOptions.width = width;
    this.renderOptions.height = height;
    this._pixiApp.renderer.resize(width, height);
    this.skiaCanvas.width = width;
    this.skiaCanvas.height = height;
    this.pdfExporter = null;
    this.syncSkiaPreview();
  }

  private syncSkiaPreview(): void {
    this._pixiApp.render();
    this.skiaRenderer.render(this._pixiApp.stage, {
      kind: 'html-canvas',
      canvas: this.skiaCanvas,
    });
  }

  private addRandomShape(): void {
    addRandomShape(this.sceneRoot);
    this.syncSkiaPreview();
  }

  private async exportPdf(): Promise<void> {
    try {
      const pdf = await import('../skia/pdf');

      if (!this.pdfExporter) {
        this.pdfExporter = await pdf.SkiaPdfExporter.create({
          width: this.renderOptions.width,
          height: this.renderOptions.height,
          background: this.renderOptions.background,
        });
      }

      this._pixiApp.render();
      const bytes = this.pdfExporter.export(this._pixiApp.stage);
      pdf.downloadPdf(bytes, 'sboard-export.pdf');
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Не удалось экспортировать PDF. Подробности в консоли.');
    }
  }
}
