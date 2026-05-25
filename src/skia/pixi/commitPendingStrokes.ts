import { Graphics, GraphicsPath, type Container as PixiContainer } from 'pixi.js';

function hasDrawablePath(path: GraphicsPath): boolean {
  return path.instructions.some(
    (instruction) => instruction.action !== 'moveTo' && instruction.action !== 'closePath',
  );
}

function commitGraphicsStroke(graphics: Graphics): void {
  const ctx = graphics.context as unknown as {
    _activePath: GraphicsPath;
    strokeStyle: { width?: number };
    stroke(): void;
  };
  const activePath = ctx._activePath;

  if (!hasDrawablePath(activePath)) {
    return;
  }

  const width = ctx.strokeStyle.width ?? 0;
  if (width <= 0) {
    return;
  }

  ctx.stroke();
}

/** Commits legacy open paths (lineStyle + moveTo/lineTo) so Pixi and Skia share instructions. */
export function commitPendingStrokes(node: PixiContainer): void {
  if (node instanceof Graphics) {
    commitGraphicsStroke(node);
  }

  for (const child of node.children) {
    commitPendingStrokes(child as PixiContainer);
  }
}
