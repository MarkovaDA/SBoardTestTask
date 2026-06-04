import type { Container } from 'pixi.js-legacy';

import { PendingStrokeCommitter } from '../skia/pixi/strokeCommitter';
import type { DragController } from '../scene/draggable';
import { PreparedScenes } from '../scene/preparedScenes';
import { SceneSwitcher } from '../scene/sceneSwitcher';
import { SCENE_AUTO_SWITCH_MS } from './constants';
import type { PixiRuntime } from './pixiRuntime';

/** Scene switching, panel controls and drag interaction on the active scene. */
export class SceneRuntime {
  private sceneSwitcher!: SceneSwitcher;
  private sceneRoot!: Container;
  private dragController: DragController | null = null;

  readonly strokeCommitter = new PendingStrokeCommitter();

  constructor(
    private readonly pixi: PixiRuntime,
    private readonly preparedScenes: PreparedScenes,
    private readonly sceneButtons: HTMLButtonElement[],
    private readonly autoSceneBtn: HTMLButtonElement | null,
    private readonly syncPreview: () => void,
  ) {}

  private readonly handleSceneChange = (scene: Container, index: number): void => {
    this.onSceneSwitched(scene, index);
  };
  
  get activeScene(): Container {
    return this.sceneRoot;
  }

  get drag(): DragController | null {
    return this.dragController;
  }

  async init(): Promise<void> {
    this.sceneSwitcher = new SceneSwitcher(
      this.pixi.sceneSlot,
      this.preparedScenes,
      this.handleSceneChange,
    );

    await this.sceneSwitcher.mountInitialScene();
  }

  setupControls(): void {
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

  clearDragHandlers(): void {
    this.dragController?.clear();
  }

  private onSceneSwitched(scene: Container, _index: number): void {
    try {
      this.sceneRoot = scene;

      void this.setupDragging();
      this.updateSceneButtons();
      this.syncPreview();
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

    this.dragController = new DragController(this.pixi.stage, () => this.syncPreview());
    this.strokeCommitter.commit(this.sceneRoot);
    this.dragController.enableOnDescendants(this.sceneRoot);
  }
}
