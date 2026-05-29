import type { Application, Container, Graphics } from 'pixi.js-legacy';

import type { SkiaRendererOptions } from '../types';
import type { SkiaPdfExporter } from '../skia/pdf';

import { PendingStrokeCommitter } from '../skia/pixi/strokeCommitter';

import type { DragController } from '../scene/draggable';
import { PreparedScenes } from '../scene/preparedScenes';
import { SceneSwitcher } from '../scene/sceneSwitcher';

import { setControlPanelReady } from '../ui/controlPanel';
import { CanvasLayout } from './layout';
import {
  PDF_EXPORT_BUTTON_LABEL,
  PDF_EXPORT_ERROR_MESSAGE,
  PDF_EXPORT_FILENAME,
  PDF_EXPORT_LOADING_LABEL,
  PIXI_RESOLUTION,
  SCENE_AUTO_SWITCH_MS,
  SCENE_BACKGROUND,
} from './constants';

export type AppBootProgress = (message: string) => void;

export class App {
  private readonly _pixiApp: Application;
  private readonly sceneSlot: Container;
  private readonly preparedScenes: PreparedScenes;
  private sceneSwitcher!: SceneSwitcher;
  private sceneRoot!: Container;
  private readonly skiaCanvas: HTMLCanvasElement;
  private readonly renderOptions: SkiaRendererOptions;
  private readonly exportBtn: HTMLButtonElement;

  private readonly canvasLayout = new CanvasLayout();
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
    skiaCanvas: HTMLCanvasElement,
    renderOptions: SkiaRendererOptions,
    exportBtn: HTMLButtonElement,
  ) {
    this._pixiApp = pixiApp;
    this.sceneSlot = sceneSlot;
    this.preparedScenes = preparedScenes;
    this.skiaCanvas = skiaCanvas;
    this.renderOptions = renderOptions;
    this.exportBtn = exportBtn;
  }

  static async create(onProgress?: AppBootProgress): Promise<App> {
    onProgress?.('Проверка интерфейса…');

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

    for (let index = 0; index < preparedScenes.sceneCount; index += 1) {
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

    onProgress?.('Загрузка Pixi…');
    const { Application, Container } = await import('pixi.js-legacy');

    onProgress?.('Инициализация canvas…');
    const pixiApp = new Application({
      width: renderOptions.width,
      height: renderOptions.height,
      background: SCENE_BACKGROUND,
      resolution: PIXI_RESOLUTION,
      preference: 'webgl',
    } as ConstructorParameters<typeof Application>[0]);

    pixiContainer.appendChild(pixiApp.view as HTMLCanvasElement);

    const sceneSlot = new Container();
    pixiApp.stage.eventMode = 'static';
    pixiApp.stage.addChild(sceneSlot);

    const app = new App(
      pixiApp,
      sceneSlot,
      preparedScenes,
      skiaCanvas,
      renderOptions,
      exportBtn,
    );

    app.sceneButtons.push(...sceneButtons);
    app.autoSceneBtn = autoSceneBtn;

    onProgress?.('Загрузка сцены…');
    await app.initSceneSwitcher();
    app.setupSceneControls();

    exportBtn.addEventListener('click', () => {
      void app.exportPdf();
    });

    randomBtn.addEventListener('click', () => {
      void app.addRandomShape();
    });

    clearBtn.addEventListener('click', () => {
      app.clearCanvas();
    });

    app.applyCanvasSize();

    window.addEventListener('resize', () => app.applyCanvasSize());

    setControlPanelReady(true);

    return app;
  }

  private async initSceneSwitcher(): Promise<void> {
    this.sceneSwitcher = new SceneSwitcher(
      this.sceneSlot,
      this.preparedScenes,
      this.handleSceneChange,
    );

    await this.sceneSwitcher.mountInitialScene();
  }

  private setupSceneControls(): void {
    this.sceneButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        void this.sceneSwitcher.switchTo(index);
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
      void this.setupDragging();
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

  private async setupDragging(): Promise<void> {
    const { DragController } = await import('../scene/draggable');

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
    this.drawPixiViewToSkiaCanvas();
  }

  private drawPixiViewToSkiaCanvas(): void {
    const ctx2d = this.skiaCanvas.getContext('2d');
    const pixiView = this._pixiApp.view as HTMLCanvasElement;

    if (!ctx2d || !(pixiView instanceof HTMLCanvasElement)) {
      return;
    }

    ctx2d.clearRect(0, 0, this.skiaCanvas.width, this.skiaCanvas.height);
    ctx2d.drawImage(pixiView, 0, 0, this.skiaCanvas.width, this.skiaCanvas.height);
  }

  private async addRandomShape(): Promise<void> {
    const { RandomShapeFactory } = await import('../scene/randomShape');
    const shape = new RandomShapeFactory().addTo(this.sceneRoot) as Graphics;

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
    const previousLabel = this.exportBtn.textContent;
    this.exportBtn.disabled = true;
    this.exportBtn.textContent = PDF_EXPORT_LOADING_LABEL;

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

      let bytes: Uint8Array;
      try {
        bytes = this.pdfExporter.export(this._pixiApp.stage);
      } catch {
        bytes = this.pdfExporter.exportFromCanvas(this._pixiApp.view as HTMLCanvasElement);
      }

      new pdf.PdfDownloader().download(bytes, PDF_EXPORT_FILENAME);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert(PDF_EXPORT_ERROR_MESSAGE);
    } finally {
      this.exportBtn.disabled = false;
      this.exportBtn.textContent = previousLabel ?? PDF_EXPORT_BUTTON_LABEL;
    }
  }
}
