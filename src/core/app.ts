import type { SkiaRendererOptions } from '../types';
import { PreparedScenes } from '../scene/preparedScenes';
import { setControlPanelReady } from '../ui/control-panel';
import { collectAppDom } from './app-dom';
import {
  PIXI_RESOLUTION,
  PROGRESS_CHECKING_INTERFACE,
  PROGRESS_LOADING_CANVAS,
  PROGRESS_LOADING_PIXI,
  PROGRESS_LOADING_SCENE,
  SCENE_BACKGROUND,
} from './constants';
import { CanvasLayout } from './layout';
import { PdfExport } from './pdf-export';
import { PixiRuntime } from './pixi-runtime';
import { SceneRuntime } from './scene-runtime';
import { SceneEditor } from './scene-editor';
import { SkiaPreview } from './skia-preview';

export type AppBootProgress = (message: string) => void;

/**
 * Application core: wires Pixi runtime, scene lifecycle, Skia preview mirror and PDF export.
 */
export class App {
  private readonly pixi: PixiRuntime;
  private readonly skiaPreview: SkiaPreview;
  private readonly scenes: SceneRuntime;
  private readonly pdfExport: PdfExport;
  private readonly editor: SceneEditor;

  private constructor(
    pixi: PixiRuntime,
    skiaCanvas: HTMLCanvasElement,
    preparedScenes: PreparedScenes,
    sceneButtons: HTMLButtonElement[],
    autoSceneBtn: HTMLButtonElement,
    exportBtn: HTMLButtonElement,
  ) {
    this.pixi = pixi;

    this.skiaPreview = new SkiaPreview(
      skiaCanvas,
      () => this.pixi.view,
      () => this.pixi.render(),
    );

    this.scenes = new SceneRuntime(
      this.pixi,
      preparedScenes,
      sceneButtons,
      autoSceneBtn,
      () => this.skiaPreview.sync(),
    );

    this.pdfExport = new PdfExport(
      exportBtn,
      () => this.pixi.renderOptions,
      () => this.pixi.stage,
      () => this.pixi.render(),
    );

    this.editor = new SceneEditor(
      () => this.scenes.activeScene,
      () => this.scenes.drag,
      this.scenes.strokeCommitter,
      () => this.skiaPreview.sync(),
    );
  }

  /** Bootstraps DOM, Pixi stage, controls and scene lifecycle, then returns ready App instance. */
  static async create(onProgress?: AppBootProgress): Promise<App> {
    onProgress?.(PROGRESS_CHECKING_INTERFACE);

    const preparedScenes = new PreparedScenes();
    const dom = collectAppDom(preparedScenes.sceneCount);
    const canvasLayout = new CanvasLayout();
    const { width, height } = canvasLayout.getViewportCanvasSize();

    const renderOptions: SkiaRendererOptions = {
      width,
      height,
      background: SCENE_BACKGROUND,
    };

    onProgress?.(PROGRESS_LOADING_PIXI);

    const { Application, Container } = await import('pixi.js-legacy');

    onProgress?.(PROGRESS_LOADING_CANVAS);

    const pixiApp = new Application({
      width: renderOptions.width,
      height: renderOptions.height,
      background: SCENE_BACKGROUND,
      resolution: PIXI_RESOLUTION,
      forceCanvas: true,
    } as ConstructorParameters<typeof Application>[0]);

    dom.pixiContainer.appendChild(pixiApp.view as HTMLCanvasElement);

    const sceneSlot = new Container();
    pixiApp.stage.eventMode = 'static';
    pixiApp.stage.addChild(sceneSlot);

    const app = new App(
      new PixiRuntime(pixiApp, sceneSlot, renderOptions),
      dom.skiaCanvas,
      preparedScenes,
      dom.sceneButtons,
      dom.autoSceneBtn,
      dom.exportBtn,
    );

    onProgress?.(PROGRESS_LOADING_SCENE);

    await app.scenes.init();
    app.scenes.setupControls();

    dom.exportBtn.addEventListener('click', () => {
      void app.pdfExport.exportPdf();
    });

    dom.randomBtn.addEventListener('click', () => {
      void app.editor.addRandomShape();
    });

    dom.clearBtn.addEventListener('click', () => {
      app.editor.clearCanvas();
    });

    app.applyCanvasSize();
    app.skiaPreview.bindPointerProxy();

    window.addEventListener('resize', () => app.applyCanvasSize());

    setControlPanelReady(true);

    return app;
  }

  private applyCanvasSize(): void {
    const { width, height } = this.pixi.resizeFromViewport();

    this.skiaPreview.resize(width, height);
    this.pdfExport.invalidate();
    this.skiaPreview.sync();
  }
}
