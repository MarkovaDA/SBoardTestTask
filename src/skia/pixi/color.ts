import type { ColorSource } from 'pixi.js-legacy';
import { Color } from 'pixi.js-legacy';

import type { SkiaCanvasKitApi, SkiaPaintApi } from '../../types';

export class SkiaPaintStyles {
  constructor(private readonly canvasKit: SkiaCanvasKitApi) {}

  toSkiaColor(color: ColorSource, alpha: number): Float32Array | number[] {
    const parsed = Color.shared.setValue(color);
    const a = (parsed.alpha ?? 1) * alpha;
    return this.canvasKit.Color(
      Math.round(parsed.red * 255),
      Math.round(parsed.green * 255),
      Math.round(parsed.blue * 255),
      a,
    );
  }

  applyFillPaint(paint: SkiaPaintApi, color: ColorSource, alpha: number): void {
    paint.setColor(this.toSkiaColor(color, alpha));
    paint.setStyle(this.canvasKit.PaintStyle.Fill as number);
    paint.setAntiAlias(true);
  }

  applyStrokePaint(
    paint: SkiaPaintApi,
    color: ColorSource,
    alpha: number,
    style: {
      width?: number;
      cap?: 'butt' | 'round' | 'square' | string;
      join?: 'miter' | 'round' | 'bevel' | string;
      miterLimit?: number;
    },
  ): void {
    const strokeWidth = Math.max(style.width ?? 1, 0.75);
    paint.setColor(this.toSkiaColor(color, alpha));
    paint.setStyle(this.canvasKit.PaintStyle.Stroke as number);
    paint.setStrokeWidth(strokeWidth);
    paint.setStrokeCap(this.toSkiaStrokeCap(style.cap));
    paint.setStrokeJoin(this.toSkiaStrokeJoin(style.join));
    const paintWithMiter = paint as unknown as { setStrokeMiter?: (value: number) => void };
    if (typeof paintWithMiter.setStrokeMiter === 'function') {
      paintWithMiter.setStrokeMiter(style.miterLimit ?? 4);
    }
    paint.setAntiAlias(true);
  }

  private toSkiaStrokeCap(cap: string | undefined): unknown {
    switch (cap) {
      case 'butt':
        return this.canvasKit.StrokeCap.Butt;
      case 'round':
        return this.canvasKit.StrokeCap.Round;
      case 'square':
        return this.canvasKit.StrokeCap.Square;
      default:
        return this.canvasKit.StrokeCap.Round;
    }
  }

  private toSkiaStrokeJoin(join: string | undefined): unknown {
    switch (join) {
      case 'miter':
        return this.canvasKit.StrokeJoin.Miter;
      case 'round':
        return this.canvasKit.StrokeJoin.Round;
      case 'bevel':
        return this.canvasKit.StrokeJoin.Bevel;
      default:
        return this.canvasKit.StrokeJoin.Round;
    }
  }
}

