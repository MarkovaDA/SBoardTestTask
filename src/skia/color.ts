import type { CanvasKit, Paint } from 'canvaskit-wasm';
import type { ColorSource } from 'pixi.js';
import { Color } from 'pixi.js';

export function toSkiaColor(
  canvasKit: CanvasKit,
  color: ColorSource,
  alpha: number,
): Float32Array | number[] {
  const parsed = Color.shared.setValue(color);
  const a = (parsed.alpha ?? 1) * alpha;
  return canvasKit.Color(
    Math.round(parsed.red * 255),
    Math.round(parsed.green * 255),
    Math.round(parsed.blue * 255),
    a,
  );
}

export function applyFillPaint(
  canvasKit: CanvasKit,
  paint: Paint,
  color: ColorSource,
  alpha: number,
): void {
  paint.setColor(toSkiaColor(canvasKit, color, alpha));
  paint.setStyle(canvasKit.PaintStyle.Fill);
  paint.setAntiAlias(true);
}

export function applyStrokePaint(
  canvasKit: CanvasKit,
  paint: Paint,
  color: ColorSource,
  alpha: number,
  width: number,
): void {
  paint.setColor(toSkiaColor(canvasKit, color, alpha));
  paint.setStyle(canvasKit.PaintStyle.Stroke);
  paint.setStrokeWidth(width);
  paint.setAntiAlias(true);
}
