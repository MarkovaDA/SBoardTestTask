import { Container, Rectangle, type FederatedPointerEvent } from 'pixi.js-legacy';

import type { DragChangeCallback } from '../types';

import { DRAG_HIT_PADDING } from './constants';

/**
 * Drag with the mouse on the Pixi canvas only (`stage` receives move/up while dragging).
 */
export class Draggable {
  private readonly target: Container;
  private readonly stage: Container;
  private readonly onChange?: DragChangeCallback;

  private dragging = false;
  private offsetX = 0;
  private offsetY = 0;
  private syncScheduled = false;

  constructor(target: Container, stage: Container, onChange?: DragChangeCallback) {
    this.target = target;
    this.stage = stage;
    this.onChange = onChange;
    this.attach();
  }

  destroy(): void {
    this.endDrag();
    this.target.off('pointerdown', this.onPointerDown);
    this.target.eventMode = 'auto';
    this.target.cursor = 'default';
    this.target.hitArea = null;
  }

  private static ensureHitArea(target: Container): void {
    const bounds = target.getLocalBounds();

    if (bounds.width <= 0 && bounds.height <= 0) {
      return;
    }

    target.hitArea = new Rectangle(
      bounds.x - DRAG_HIT_PADDING,
      bounds.y - DRAG_HIT_PADDING,
      bounds.width + DRAG_HIT_PADDING * 2,
      bounds.height + DRAG_HIT_PADDING * 2,
    );
  }

  private attach(): void {
    Draggable.ensureHitArea(this.target);
    this.target.eventMode = 'static';
    this.target.cursor = 'pointer';
    this.target.on('pointerdown', this.onPointerDown);
  }

  private scheduleChange(): void {
    if (!this.onChange || this.syncScheduled) {
      return;
    }

    this.syncScheduled = true;

    requestAnimationFrame(() => {
      this.syncScheduled = false;
      this.onChange?.();
    });
  }

  private readonly onDragMove = (event: FederatedPointerEvent): void => {
    if (!this.dragging) {
      return;
    }

    const parent = this.target.parent;

    if (!parent) {
      return;
    }

    const local = event.getLocalPosition(parent);
    this.target.position.set(local.x + this.offsetX, local.y + this.offsetY);
    this.scheduleChange();
  };

  private readonly endDrag = (): void => {
    if (!this.dragging) {
      return;
    }

    this.dragging = false;
    this.target.cursor = 'pointer';
    this.stage.off('pointermove', this.onDragMove);
    this.stage.off('pointerup', this.endDrag);
    this.stage.off('pointerupoutside', this.endDrag);
    this.scheduleChange();
  };

  private readonly onPointerDown = (event: FederatedPointerEvent): void => {
    const parent = this.target.parent;

    if (!parent) {
      return;
    }

    this.dragging = true;
    this.target.cursor = 'grabbing';
    const local = event.getLocalPosition(parent);
    this.offsetX = this.target.x - local.x;
    this.offsetY = this.target.y - local.y;
    event.stopPropagation();

    this.stage.on('pointermove', this.onDragMove);
    this.stage.on('pointerup', this.endDrag);
    this.stage.on('pointerupoutside', this.endDrag);
  };
}

/** Enables drag on scene objects and tracks active handlers. */
export class DragController {
  private readonly stage: Container;
  private readonly onChange?: DragChangeCallback;
  private readonly draggables: Draggable[] = [];

  constructor(stage: Container, onChange?: DragChangeCallback) {
    this.stage = stage;
    this.onChange = onChange;
  }

  enableOn(target: Container): Draggable {
    const draggable = new Draggable(target, this.stage, this.onChange);
    this.draggables.push(draggable);
    return draggable;
  }

  enableOnDescendants(root: Container): void {
    for (const child of root.children) {
      if (!(child instanceof Container)) {
        continue;
      }

      if (child.children.length > 0) {
        this.enableOnDescendants(child);
      } else {
        this.enableOn(child);
      }
    }
  }

  clear(): void {
    for (const draggable of this.draggables) {
      draggable.destroy();
    }
    this.draggables.length = 0;
  }
}

