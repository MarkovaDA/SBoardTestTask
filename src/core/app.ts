import type { Application, Container, Graphics } from 'pixi.js-legacy';

import type { SkiaRendererOptions } from '../types';
import type { SkiaPdfExporter } from '../skia/pdf';

import { PendingStrokeCommitter } from '../skia/pixi/strokeCommitter';

import type { DragController } from '../scene/draggable';
import { PreparedScenes } from '../scene/preparedScenes';
import { SceneSwitcher } from '../scene/sceneSwitcher';

import { setControlPanelReady } from '../ui/control-panel';
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
  private readonly exportBtn: HTMLButtonElement;
  private readonly sceneButtons: HTMLButtonElement[] = [];

  private readonly renderOptions: SkiaRendererOptions;


  private readonly canvasLayout = new CanvasLayout();
  private readonly strokeCommitter = new PendingStrokeCommitter();

  private readonly skiaActivePointers = new Set<number>();
  private pdfExporter: SkiaPdfExporter | null = null;
  private dragController: DragController | null = null;
  private autoSceneBtn: HTMLButtonElement | null = null;

  /** Handles scene-switcher callbacks and forwards the new scene to App state. */
  private readonly handleSceneChange = (scene: Container, index: number): void => {
    this.onSceneSwitched(scene, index);
  };

  /** Creates App with already prepared runtime dependencies. */
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

  /** Bootstraps DOM, Pixi stage, controls and scene lifecycle, then returns ready App instance. */
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
      forceCanvas: true,
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
    app.setupSkiaPointerProxy();

    window.addEventListener('resize', () => app.applyCanvasSize());

    setControlPanelReady(true);

    return app;
  }

  /** Initializes scene switcher and mounts the first prepared scene into stage slot. */
  private async initSceneSwitcher(): Promise<void> {
    this.sceneSwitcher = new SceneSwitcher(
      this.sceneSlot,
      this.preparedScenes,
      this.handleSceneChange,
    );

    await this.sceneSwitcher.mountInitialScene();
  }

  /** Binds panel buttons to manual and automatic scene switching actions. */
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

  /** Applies scene switch side effects: drag setup, UI state refresh and Skia preview sync. */
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

  /** Updates active state for scene buttons and auto-rotate toggle indicator. */
  private updateSceneButtons(): void {
    const activeIndex = this.sceneSwitcher.activeIndex;

    this.sceneButtons.forEach((button, index) => {
      button.classList.toggle('is-active', index === activeIndex);
    });

    this.autoSceneBtn?.classList.toggle('is-active', this.sceneSwitcher.isAutoRotateEnabled);
  }

  /** Recreates drag handlers for current scene descendants and commits pending stroke data. */
  private async setupDragging(): Promise<void> {
    const { DragController } = await import('../scene/draggable');

    this.dragController?.clear();

    this.dragController = new DragController(this._pixiApp.stage, () => this.syncSkiaPreview());
    this.strokeCommitter.commit(this.sceneRoot);
    this.dragController.enableOnDescendants(this.sceneRoot);
  }

  /** Resizes Pixi and Skia canvases to viewport, then invalidates PDF cache and redraws preview. */
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

  /** Forwards pointer events from Skia canvas to Pixi canvas so both panels can drive interactions. */
  private setupSkiaPointerProxy(): void {
    const pixiView = this._pixiApp.view as HTMLCanvasElement;
    
    if (!(pixiView instanceof HTMLCanvasElement) || typeof PointerEvent === 'undefined') {
      return;
    }

    const forwardPointerEvent = (event: PointerEvent, type: string): void => {
      const forwarded = new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        isPrimary: event.isPrimary,
        clientX: event.clientX,
        clientY: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY,
        button: event.button,
        buttons: event.buttons,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        pressure: event.pressure,
        tangentialPressure: event.tangentialPressure,
        tiltX: event.tiltX,
        tiltY: event.tiltY,
        twist: event.twist,
        width: event.width,
        height: event.height,
      });

      pixiView.dispatchEvent(forwarded);
    };

    this.skiaCanvas.addEventListener('pointerdown', (event) => {
      this.skiaActivePointers.add(event.pointerId);
      this.skiaCanvas.setPointerCapture?.(event.pointerId);
      forwardPointerEvent(event, 'pointerdown');
    });

    this.skiaCanvas.addEventListener('pointermove', (event) => {
      if (!this.skiaActivePointers.has(event.pointerId)) {
        return;
      }
      forwardPointerEvent(event, 'pointermove');
    });

    const finishPointer = (event: PointerEvent, outside: boolean): void => {
      if (!this.skiaActivePointers.has(event.pointerId)) {
        return;
      }

      this.skiaActivePointers.delete(event.pointerId);
      this.skiaCanvas.releasePointerCapture?.(event.pointerId);
      forwardPointerEvent(event, outside ? 'pointerupoutside' : 'pointerup');
    };

    this.skiaCanvas.addEventListener('pointerup', (event) => {
      finishPointer(event, false);
    });

    this.skiaCanvas.addEventListener('pointercancel', (event) => {
      finishPointer(event, true);
    });

    this.skiaCanvas.addEventListener('pointerleave', (event) => {
      finishPointer(event, true);
    });
  }

  /** Renders current Pixi stage and mirrors it to Skia preview canvas. */
  private syncSkiaPreview(): void {
    this._pixiApp.render();
    this.drawPixiViewToSkiaCanvas();
  }

  /** Draws current Pixi canvas bitmap into the Skia preview 2D context. */
  private drawPixiViewToSkiaCanvas(): void {
    const ctx2d = this.skiaCanvas.getContext('2d');
    const pixiView = this._pixiApp.view as HTMLCanvasElement;

    if (!ctx2d || !(pixiView instanceof HTMLCanvasElement)) {
      return;
    }

    ctx2d.clearRect(0, 0, this.skiaCanvas.width, this.skiaCanvas.height);
    ctx2d.drawImage(pixiView, 0, 0, this.skiaCanvas.width, this.skiaCanvas.height);
  }

  /** Adds a random shape to active scene, enables dragging for it and refreshes preview. */
  private async addRandomShape(): Promise<void> {
    const { RandomShapeFactory } = await import('../scene/randomShape');
    const shape = new RandomShapeFactory().addTo(this.sceneRoot) as Graphics;

    this.strokeCommitter.commit(shape);
    this.dragController?.enableOn(shape);
    this.syncSkiaPreview();
  }

  /** Clears all objects from active scene and redraws Skia preview. */
  private clearCanvas(): void {
    this.dragController?.clear();

    for (const child of this.sceneRoot.removeChildren()) {
      child.destroy({ children: true });
    }

    this.syncSkiaPreview();
  }

  /** Exports the active scene to vector PDF with temporary loading state on export button. */
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
      const bytes = this.pdfExporter.export(this._pixiApp.stage);

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
