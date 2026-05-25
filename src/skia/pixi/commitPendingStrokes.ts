import { Graphics, GraphicsPath, type Container as PixiContainer } from 'pixi.js';

/** Commits legacy open paths (lineStyle + moveTo/lineTo) so Pixi and Skia share instructions. */
export class PendingStrokeCommitter {
  commit(node: PixiContainer): void {
    if (node instanceof Graphics) {
      this.commitGraphicsStroke(node);
    }

    for (const child of node.children) {
      this.commit(child as PixiContainer);
    }
  }

  private hasDrawablePath(path: GraphicsPath): boolean {
    return path.instructions.some(
      (instruction) => instruction.action !== 'moveTo' && instruction.action !== 'closePath',
    );
  }

  private commitGraphicsStroke(graphics: Graphics): void {
    const ctx = graphics.context as unknown as {
      _activePath: GraphicsPath;
      strokeStyle: { width?: number };
      stroke(): void;
    };
    const activePath = ctx._activePath;

    if (!this.hasDrawablePath(activePath)) {
      return;
    }

    const width = ctx.strokeStyle.width ?? 0;
    if (width <= 0) {
      return;
    }

    ctx.stroke();
  }
}
