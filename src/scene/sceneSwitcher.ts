import type { Container } from 'pixi.js';

import type { PreparedSceneEntry } from './preparedScenes';

export type SceneChangeHandler = (scene: Container, index: number) => void;

/** Swaps preset containers in a stage slot; supports manual index and setTimeout rotation. */
export class SceneSwitcher {
  private currentIndex = 0;
  private autoTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly slot: Container,
    private readonly entries: readonly PreparedSceneEntry[],
    private readonly onSceneChange: SceneChangeHandler,
  ) {
    this.mountCurrentScene();
  }

  get currentScene(): Container {
    return this.entries[this.currentIndex]!.container;
  }

  get activeIndex(): number {
    return this.currentIndex;
  }

  get isAutoRotateEnabled(): boolean {
    return this.autoTimer !== null;
  }

  switchTo(index: number): void {
    if (index < 0 || index >= this.entries.length || index === this.currentIndex) {
      return;
    }

    this.stopAutoRotate();
    this.applyIndex(index);
  }

  startAutoRotate(intervalMs: number): void {
    this.stopAutoRotate();

    const tick = (): void => {
      const nextIndex = (this.currentIndex + 1) % this.entries.length;
      this.applyIndex(nextIndex);
      this.autoTimer = setTimeout(tick, intervalMs);
    };

    this.autoTimer = setTimeout(tick, intervalMs);
  }

  stopAutoRotate(): void {
    if (this.autoTimer !== null) {
      clearTimeout(this.autoTimer);
      this.autoTimer = null;
    }
  }

  private applyIndex(index: number): void {
    this.currentIndex = index;
    
    this.mountCurrentScene();
    this.onSceneChange(this.currentScene, this.currentIndex);
  }

  private mountCurrentScene(): void {
    this.slot.removeChildren();
    this.slot.addChild(this.currentScene);
  }
}
