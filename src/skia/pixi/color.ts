import type { ColorSource, ConvertedStrokeStyle } from 'pixi.js';
import { Color } from 'pixi.js';

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
    style: Pick<ConvertedStrokeStyle, 'width' | 'cap' | 'join'>,
  ): void {
    paint.setColor(this.toSkiaColor(color, alpha));
    paint.setStyle(this.canvasKit.PaintStyle.Stroke as number);
    paint.setStrokeWidth(style.width ?? 1);
    paint.setStrokeCap(this.toSkiaStrokeCap(style.cap));
    paint.setStrokeJoin(this.toSkiaStrokeJoin(style.join));
    paint.setAntiAlias(true);
  }

  private toSkiaStrokeCap(cap: ConvertedStrokeStyle['cap']): unknown {
    switch (cap) {
      case 'round':
        return this.canvasKit.StrokeCap.Round;
      case 'square':
        return this.canvasKit.StrokeCap.Square;
      default:
        return this.canvasKit.StrokeCap.Butt;
    }
  }

  private toSkiaStrokeJoin(join: ConvertedStrokeStyle['join']): unknown {
    switch (join) {
      case 'round':
        return this.canvasKit.StrokeJoin.Round;
      case 'bevel':
        return this.canvasKit.StrokeJoin.Bevel;
      default:
        return this.canvasKit.StrokeJoin.Miter;
    }
  }
}
