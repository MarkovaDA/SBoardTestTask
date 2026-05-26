import type { SkiaImageApi } from './skiaImage';
import type { SkiaPaintApi } from './skiaPaint';
import type { SkiaPathApi } from './skiaPath';

/** Minimal CanvasKit surface used by PixiSceneDrawer (preview + PDF builds). */
export interface SkiaCanvasKitApi {
  Color(r: number, g: number, b: number, a?: number): Float32Array | number[];
  parseColorString(color: string): Float32Array | number[];
  PaintStyle: { Fill: unknown; Stroke: unknown };
  StrokeCap: { Butt: unknown; Round: unknown; Square: unknown };
  StrokeJoin: { Miter: unknown; Round: unknown; Bevel: unknown };
  LTRBRect(left: number, top: number, right: number, bottom: number): Float32Array | number[];
  Paint: new () => SkiaPaintApi;
  Path: {
    MakeFromSVGString(str: string): SkiaPathApi | null;
  };
  MakeImageFromCanvasImageSource(src: CanvasImageSource): SkiaImageApi;
}
