// TODO: можно использовать pixi/draggable или pixi/interaction 
// TODO: перейти на классовый подход
import { Container, Rectangle, type FederatedPointerEvent } from 'pixi.js';

const HIT_PADDING = 12;

export type DragChangeCallback = () => void;

function ensureHitArea(target: Container): void {
  const bounds = target.getLocalBounds();

  if (bounds.width <= 0 && bounds.height <= 0) {
    return;
  }

  target.hitArea = new Rectangle(
    bounds.x - HIT_PADDING,
    bounds.y - HIT_PADDING,
    bounds.width + HIT_PADDING * 2,
    bounds.height + HIT_PADDING * 2,
  );
}

/**
 * Drag with the mouse on the Pixi canvas only (`stage` receives move/up while dragging).
 */
export function enableDrag(
  target: Container,
  stage: Container,
  onChange?: DragChangeCallback,
): void {
  ensureHitArea(target);

  target.eventMode = 'static';
  target.cursor = 'pointer';

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let syncScheduled = false;

  const scheduleChange = (): void => {
    if (!onChange || syncScheduled) {
      return;
    }
    
    syncScheduled = true;

    requestAnimationFrame(() => {
      syncScheduled = false;
      onChange();
    });
  };

  const onDragMove = (event: FederatedPointerEvent): void => {
    if (!dragging) {
      return;
    }

    const parent = target.parent;

    if (!parent) {
      return;
    }

    const local = event.getLocalPosition(parent);
    target.position.set(local.x + offsetX, local.y + offsetY);
    scheduleChange();
  };

  const endDrag = (): void => {
    if (!dragging) {
      return;
    }

    dragging = false;
    target.cursor = 'pointer';
    stage.off('pointermove', onDragMove);
    stage.off('pointerup', endDrag);
    stage.off('pointerupoutside', endDrag);
    scheduleChange();
  };

  target.on('pointerdown', (event: FederatedPointerEvent) => {
    const parent = target.parent;
    if (!parent) {
      return;
    }

    dragging = true;
    target.cursor = 'grabbing';
    const local = event.getLocalPosition(parent);
    offsetX = target.x - local.x;
    offsetY = target.y - local.y;
    event.stopPropagation();

    stage.on('pointermove', onDragMove);
    stage.on('pointerup', endDrag);
    stage.on('pointerupoutside', endDrag);
  });
}

/** Enables drag on all descendants of `root` (not on `root` itself). */
export function enableDragOnDescendants(
  root: Container,
  stage: Container,
  onChange?: DragChangeCallback,
): void {
  for (const child of root.children) {
    enableDrag(child, stage, onChange);

    if (child instanceof Container && child.children.length > 0) {
      enableDragOnDescendants(child, stage, onChange);
    }
  }
}
