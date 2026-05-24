import type { Canvas, CanvasKit } from 'canvaskit-wasm';
import type { Matrix } from 'pixi.js';

/** Pixi 2D affine matrix → CanvasKit 3×3 (row-major). */
export function concatPixiMatrix(canvas: Canvas, matrix: Matrix): void {
  canvas.concat([matrix.a, matrix.c, matrix.tx, matrix.b, matrix.d, matrix.ty, 0, 0, 1]);
}

export function clearCanvas(
  canvasKit: CanvasKit,
  canvas: Canvas,
  width: number,
  height: number,
  background: string,
): void {
  const paint = new canvasKit.Paint();
  paint.setColor(canvasKit.parseColorString(background));
  paint.setStyle(canvasKit.PaintStyle.Fill);
  canvas.drawRect(canvasKit.LTRBRect(0, 0, width, height), paint);
  paint.delete();
}
