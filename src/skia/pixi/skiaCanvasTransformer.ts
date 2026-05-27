import type { Container, Matrix } from 'pixi.js-legacy';

import type { SkiaCanvasApi, SkiaCanvasKitApi } from '../../types';

export class SkiaCanvasTransformer {
  constructor(private readonly canvasKit: SkiaCanvasKitApi) {}

  /** Pixi 2D affine matrix в†’ CanvasKit 3Г—3 (row-major). */
  concatPixiMatrix(canvas: SkiaCanvasApi, matrix: Matrix): void {
    canvas.concat([matrix.a, matrix.c, matrix.tx, matrix.b, matrix.d, matrix.ty, 0, 0, 1]);
  }

  /** Same transform Pixi uses when drawing (relative to the render group / canvas). */
  concatGroupTransform(canvas: SkiaCanvasApi, node: Container): void {
    const matrix = (node as unknown as { worldTransform?: Matrix; groupTransform?: Matrix }).worldTransform
      ?? (node as unknown as { worldTransform?: Matrix; groupTransform?: Matrix }).groupTransform;
    if (!matrix) {
      return;
    }
    this.concatPixiMatrix(canvas, matrix);
  }

  clearCanvas(
    canvas: SkiaCanvasApi,
    width: number,
    height: number,
    background: string,
  ): void {
    const paint = new this.canvasKit.Paint();
    paint.setColor(this.canvasKit.parseColorString(background));
    paint.setStyle(this.canvasKit.PaintStyle.Fill as number);
    canvas.drawRect(this.canvasKit.LTRBRect(0, 0, width, height), paint);
    paint.delete();
  }
}

