import type { Container, Graphics } from 'pixi.js-legacy';

import type { DragController } from '../scene/draggable';
import { PendingStrokeCommitter } from '../skia/pixi/strokeCommitter';

/** Adds and removes drawable content on the active scene. */
export class SceneEditor {
  constructor(
    private readonly getActiveScene: () => Container,
    private readonly getDragController: () => DragController | null,
    private readonly strokeCommitter: PendingStrokeCommitter,
    private readonly syncPreview: () => void,
  ) {}

  async addRandomShape(): Promise<void> {
    const { RandomShapeFactory } = await import('../scene/randomShape');
    const shape = new RandomShapeFactory().addTo(this.getActiveScene()) as Graphics;

    this.strokeCommitter.commit(shape);
    this.getDragController()?.enableOn(shape);
    this.syncPreview();
  }

  clearCanvas(): void {
    const scene = this.getActiveScene();

    this.getDragController()?.clear();

    for (const child of scene.removeChildren()) {
      child.destroy({ children: true });
    }

    this.syncPreview();
  }
}
