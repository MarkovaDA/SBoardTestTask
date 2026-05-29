import type { Container } from 'pixi.js-legacy';

import type { PreparedScenes } from './preparedScenes';

export type SceneChangeHandler = (scene: Container, index: number) => void;

/** Swaps preset containers in a stage slot; supports manual index and setTimeout rotation. */
export class SceneSwitcher {
  private currentIndex = 0;
  private autoTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly slot: Container,
    private readonly scenes: PreparedScenes,
    private readonly onSceneChange: SceneChangeHandler,
  ) {}

  get currentScene(): Container {
    return this.scenes.getScene(this.currentIndex);
  }

  get activeIndex(): number {
    return this.currentIndex;
  }

  get isAutoRotateEnabled(): boolean {
    return this.autoTimer !== null;
  }

  async mountInitialScene(): Promise<void> {
    await this.scenes.ensureScene(0);
    this.mountCurrentScene();
    this.onSceneChange(this.currentScene, this.currentIndex);
  }

  async switchTo(index: number): Promise<void> {
    if (index < 0 || index >= this.scenes.sceneCount || index === this.currentIndex) {
      return;
    }

    this.stopAutoRotate();
    await this.applyIndex(index);
  }

  startAutoRotate(intervalMs: number): void {
    this.stopAutoRotate();

    const tick = (): void => {
      const nextIndex = (this.currentIndex + 1) % this.scenes.sceneCount;
      void this.applyIndex(nextIndex).then(() => {
        if (this.autoTimer !== null) {
          this.autoTimer = setTimeout(tick, intervalMs);
        }
      });
    };

    this.autoTimer = setTimeout(tick, intervalMs);
  }

  stopAutoRotate(): void {
    if (this.autoTimer !== null) {
      clearTimeout(this.autoTimer);
      this.autoTimer = null;
    }
  }

  private async applyIndex(index: number): Promise<void> {
    await this.scenes.ensureScene(index);
    this.currentIndex = index;
    this.mountCurrentScene();
    this.onSceneChange(this.currentScene, this.currentIndex);
  }

  private mountCurrentScene(): void {
    this.slot.removeChildren();
    this.slot.addChild(this.currentScene);
  }
}
