import type { SkiaCanvasApi, SkiaCanvasKitApi } from '../types';
import type { Container, Matrix } from 'pixi.js';

/** Pixi 2D affine matrix → CanvasKit 3×3 (row-major). */
export function concatPixiMatrix(canvas: SkiaCanvasApi, matrix: Matrix): void {
  canvas.concat([matrix.a, matrix.c, matrix.tx, matrix.b, matrix.d, matrix.ty, 0, 0, 1]);
}

/** Same transform Pixi uses when drawing (relative to the render group / canvas). */
export function concatGroupTransform(canvas: SkiaCanvasApi, node: Container): void {
  concatPixiMatrix(canvas, node.groupTransform);
}

export function clearCanvas(
  canvasKit: SkiaCanvasKitApi,
  canvas: SkiaCanvasApi,
  width: number,
  height: number,
  background: string,
): void {
  const paint = new canvasKit.Paint();
  paint.setColor(canvasKit.parseColorString(background));
  paint.setStyle(canvasKit.PaintStyle.Fill as number);
  canvas.drawRect(canvasKit.LTRBRect(0, 0, width, height), paint);
  paint.delete();
}
