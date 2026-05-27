import { Application, Container } from 'pixi.js';

import type { SkiaRendererOptions } from '../types';
import type { SkiaPdfExporter } from '../skia/pdf';

import { CanvasKitLoader, PixiToSkiaRenderer } from '../skia/pixi';
import { PendingStrokeCommitter } from '../skia/pixi/strokeCommitter';

import { PreparedScenes } from '../scene/preparedScenes';
import { SceneSwitcher } from '../scene/sceneSwitcher';
import { DragController } from '../scene/draggable';
import { RandomShapeFactory } from '../scene/randomShape';

import { CanvasLayout } from './layout';
import {
  PDF_EXPORT_ERROR_MESSAGE,
  PDF_EXPORT_FILENAME,
  PIXI_RESOLUTION,
  SCENE_AUTO_SWITCH_MS,
  SCENE_BACKGROUND,
} from './constants';

export class App {
  private readonly _pixiApp: Application;
  private readonly sceneSlot: Container;
  private readonly preparedScenes: PreparedScenes;
  private sceneSwitcher!: SceneSwitcher;
  private sceneRoot: Container;
  private readonly skiaRenderer: PixiToSkiaRenderer;
  private readonly skiaCanvas: HTMLCanvasElement;
  private readonly renderOptions: SkiaRendererOptions;
  private readonly canvasLayout = new CanvasLayout();
  private readonly randomShapeFactory = new RandomShapeFactory();
  private readonly strokeCommitter = new PendingStrokeCommitter();
  private readonly sceneButtons: HTMLButtonElement[] = [];
  private pdfExporter: SkiaPdfExporter | null = null;
  private dragController: DragController | null = null;
  private autoSceneBtn: HTMLButtonElement | null = null;

  private readonly handleSceneChange = (scene: Container, index: number): void => {
    this.onSceneSwitched(scene, index);
  };

  private constructor(
    pixiApp: Application,
    sceneSlot: Container,
    preparedScenes: PreparedScenes,
    skiaRenderer: PixiToSkiaRenderer,
    skiaCanvas: HTMLCanvasElement,
    renderOptions: SkiaRendererOptions,
  ) {
    this._pixiApp = pixiApp;
    this.sceneSlot = sceneSlot;
    this.preparedScenes = preparedScenes;
    this.sceneRoot = preparedScenes.entries[0]!.container;
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
    const autoSceneBtn = document.getElementById('btn-scene-auto');

    if (!pixiContainer || !(skiaCanvas instanceof HTMLCanvasElement)) {
      throw new Error('Required DOM elements not found');
    }

    if (
      !(exportBtn instanceof HTMLButtonElement)
      || !(randomBtn instanceof HTMLButtonElement)
      || !(clearBtn instanceof HTMLButtonElement)
      || !(autoSceneBtn instanceof HTMLButtonElement)
    ) {
      throw new Error('Control panel buttons not found');
    }

    const preparedScenes = new PreparedScenes();
    const sceneButtons: HTMLButtonElement[] = [];

    for (let index = 0; index < preparedScenes.entries.length; index += 1) {
      const button = document.getElementById(`btn-scene-${index}`);
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error(`Scene button btn-scene-${index} not found`);
      }

      sceneButtons.push(button);
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

    const sceneSlot = new Container();
    pixiApp.stage.eventMode = 'static';
    pixiApp.stage.addChild(sceneSlot);

    const app = new App(
      pixiApp,
      sceneSlot,
      preparedScenes,
      new PixiToSkiaRenderer(canvasKit, renderOptions),
      skiaCanvas,
      renderOptions,
    );

    app.sceneButtons.push(...sceneButtons);
    app.autoSceneBtn = autoSceneBtn;

    app.initSceneSwitcher();
    app.setupSceneControls();

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

  private initSceneSwitcher(): void {
    this.sceneSwitcher = new SceneSwitcher(
      this.sceneSlot,
      this.preparedScenes.entries,
      this.handleSceneChange,
    );
    
    this.onSceneSwitched(this.sceneSwitcher.currentScene, this.sceneSwitcher.activeIndex);
  }

  private setupSceneControls(): void {
    this.sceneButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        this.sceneSwitcher.switchTo(index);
      });
    });

    this.autoSceneBtn?.addEventListener('click', () => {
      if (this.sceneSwitcher.isAutoRotateEnabled) {
        this.sceneSwitcher.stopAutoRotate();
      } else {
        this.sceneSwitcher.startAutoRotate(SCENE_AUTO_SWITCH_MS);
      }
      this.updateSceneButtons();
    });
  }

  private onSceneSwitched(scene: Container, _index: number): void {
    try {
      this.sceneRoot = scene;
      this.setupDragging();
      this.updateSceneButtons();
      this.syncSkiaPreview();
    } catch (error) {
      console.error('Scene switch failed:', error);
    }
  }

  private updateSceneButtons(): void {
    const activeIndex = this.sceneSwitcher.activeIndex;

    this.sceneButtons.forEach((button, index) => {
      button.classList.toggle('is-active', index === activeIndex);
    });

    this.autoSceneBtn?.classList.toggle('is-active', this.sceneSwitcher.isAutoRotateEnabled);
  }

  private setupDragging(): void {
    this.dragController?.clear();
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
    this.skiaRenderer.convertPixiContainerToSkia(this._pixiApp.stage, this.skiaCanvas);
  }

  private addRandomShape(): void {
    const shape = this.randomShapeFactory.addTo(this.sceneRoot);
    this.strokeCommitter.commit(shape);
    this.dragController?.enableOn(shape);
    this.syncSkiaPreview();
  }

  private clearCanvas(): void {
    this.dragController?.clear();

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
