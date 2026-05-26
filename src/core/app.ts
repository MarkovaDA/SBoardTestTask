import { Application, Container } from 'pixi.js';

import type { SkiaRendererOptions } from '../types';
import type { SkiaPdfExporter } from '../skia/pdf';

import { CanvasKitLoader, PixiToSkiaRenderer } from '../skia/pixi';
import { PendingStrokeCommitter } from '../skia/pixi/strokeCommitter';

import { DemoScene } from '../scene/demoScene';
import { DragController } from '../scene/draggable';
import { RandomShapeFactory } from '../scene/randomShape';

import { CanvasLayout } from './layout';
import {
  PDF_EXPORT_ERROR_MESSAGE,
  PDF_EXPORT_FILENAME,
  PIXI_RESOLUTION,
  SCENE_BACKGROUND,
} from './constants';

export class App {
  private readonly _pixiApp: Application;
  private readonly sceneRoot: Container;
  private readonly skiaRenderer: PixiToSkiaRenderer;
  private readonly skiaCanvas: HTMLCanvasElement;
  private readonly renderOptions: SkiaRendererOptions;
  private readonly canvasLayout = new CanvasLayout();
  private readonly randomShapeFactory = new RandomShapeFactory();
  private readonly strokeCommitter = new PendingStrokeCommitter();
  private pdfExporter: SkiaPdfExporter | null = null;
  private dragController!: DragController;

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
    const canvasKit = await new CanvasKitLoader().load();

    const pixiContainer = document.getElementById('pixi-container');
    const skiaCanvas = document.getElementById('skia-canvas');
    const exportBtn = document.getElementById('btn-export-pdf');
    const randomBtn = document.getElementById('btn-random-shape');
    const clearBtn = document.getElementById('btn-clear-canvas');

    if (!pixiContainer || !(skiaCanvas instanceof HTMLCanvasElement)) {
      throw new Error('Required DOM elements not found');
    }

    if (
      !(exportBtn instanceof HTMLButtonElement)
      || !(randomBtn instanceof HTMLButtonElement)
      || !(clearBtn instanceof HTMLButtonElement)
    ) {
      throw new Error('Control panel buttons not found');
    }

    const canvasLayout = new CanvasLayout();
    const { width, height } = canvasLayout.getViewportCanvasSize();
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
      resolution: PIXI_RESOLUTION,
    });

    pixiContainer.appendChild(pixiApp.canvas);

    const sceneRoot = new DemoScene().build();
    pixiApp.stage.eventMode = 'static';
    pixiApp.stage.addChild(sceneRoot);

    const skiaRenderer = new PixiToSkiaRenderer(canvasKit, renderOptions);
    const app = new App(pixiApp, sceneRoot, skiaRenderer, skiaCanvas, renderOptions);

    app.setupDragging();

    exportBtn.addEventListener('click', () => {
      void app.exportPdf();
    });

    randomBtn.addEventListener('click', () => {
      app.addRandomShape();
    });

    clearBtn.addEventListener('click', () => {
      app.clearCanvas();
    });

    app.applyCanvasSize();

    window.addEventListener('resize', () => app.applyCanvasSize());
    return app;
  }

  private setupDragging(): void {
    this.dragController = new DragController(this._pixiApp.stage, () => this.syncSkiaPreview());
    this.strokeCommitter.commit(this.sceneRoot);
    this.dragController.enableOnDescendants(this.sceneRoot);
  }

  private applyCanvasSize(): void {
    const { width, height } = this.canvasLayout.getViewportCanvasSize();
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
    const shape = this.randomShapeFactory.addTo(this.sceneRoot);
    this.strokeCommitter.commit(shape);
    this.dragController.enableOn(shape);
    this.syncSkiaPreview();
  }

  private clearCanvas(): void {
    this.dragController.clear();

    for (const child of this.sceneRoot.removeChildren()) {
      child.destroy({ children: true });
    }

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
      new pdf.PdfDownloader().download(bytes, PDF_EXPORT_FILENAME);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert(PDF_EXPORT_ERROR_MESSAGE);
    }
  }
}
