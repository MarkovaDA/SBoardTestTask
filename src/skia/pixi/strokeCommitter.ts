import { Graphics, type Container as PixiContainer } from 'pixi.js-legacy';

/** Commits any remaining open stroke paths so Pixi and Skia share instructions. */
export class PendingStrokeCommitter {
  commit(node: PixiContainer): void {
    if (node instanceof Graphics) {
      this.commitGraphicsStroke(node);
    }

    for (const child of node.children) {
      this.commit(child as PixiContainer);
    }
  }

  private hasDrawablePath(path: { instructions?: Array<{ action?: string }> } | undefined): boolean {
    if (!path?.instructions) {
      return false;
    }

    return path.instructions.some(
      (instruction) => instruction.action !== 'moveTo' && instruction.action !== 'closePath',
    );
  }

  private commitGraphicsStroke(graphics: Graphics): void {
    const ctx = (graphics as unknown as { context?: unknown }).context as
      | {
      _activePath?: { instructions?: Array<{ action?: string }> };
      strokeStyle?: { width?: number };
      stroke?: () => void;
    }
      | undefined;

    if (!ctx) {
      return;
    }

    const activePath = ctx._activePath;

    if (!this.hasDrawablePath(activePath)) {
      return;
    }

    const width = ctx.strokeStyle?.width ?? 0;

    if (width <= 0) {
      return;
    }

    ctx.stroke?.();
  }
}

