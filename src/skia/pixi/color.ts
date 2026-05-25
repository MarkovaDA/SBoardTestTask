import type { SkiaCanvasKitApi, SkiaPaintApi } from '../types';
import type { ColorSource, ConvertedStrokeStyle } from 'pixi.js';
import { Color } from 'pixi.js';

export function toSkiaColor(
  canvasKit: SkiaCanvasKitApi,
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
  canvasKit: SkiaCanvasKitApi,
  paint: SkiaPaintApi,
  color: ColorSource,
  alpha: number,
): void {
  paint.setColor(toSkiaColor(canvasKit, color, alpha));
  paint.setStyle(canvasKit.PaintStyle.Fill as number);
  paint.setAntiAlias(true);
}

export function applyStrokePaint(
  canvasKit: SkiaCanvasKitApi,
  paint: SkiaPaintApi,
  color: ColorSource,
  alpha: number,
  style: Pick<ConvertedStrokeStyle, 'width' | 'cap' | 'join'>,
): void {
  paint.setColor(toSkiaColor(canvasKit, color, alpha));
  paint.setStyle(canvasKit.PaintStyle.Stroke as number);
  paint.setStrokeWidth(style.width ?? 1);
  paint.setStrokeCap(toSkiaStrokeCap(canvasKit, style.cap));
  paint.setStrokeJoin(toSkiaStrokeJoin(canvasKit, style.join));
  paint.setAntiAlias(true);
}

function toSkiaStrokeCap(canvasKit: SkiaCanvasKitApi, cap: ConvertedStrokeStyle['cap']): unknown {
  switch (cap) {
    case 'round':
      return canvasKit.StrokeCap.Round;
    case 'square':
      return canvasKit.StrokeCap.Square;
    default:
      return canvasKit.StrokeCap.Butt;
  }
}

function toSkiaStrokeJoin(canvasKit: SkiaCanvasKitApi, join: ConvertedStrokeStyle['join']): unknown {
  switch (join) {
    case 'round':
      return canvasKit.StrokeJoin.Round;
    case 'bevel':
      return canvasKit.StrokeJoin.Bevel;
    default:
      return canvasKit.StrokeJoin.Miter;
  }
}
