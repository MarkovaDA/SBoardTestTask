import type { SkiaImageApi } from './skiaImage';
import type { SkiaPaintApi } from './skiaPaint';
import type { SkiaPathApi } from './skiaPath';

export interface SkiaCanvasApi {
  save(): void;
  restore(): void;
  concat(matrix: number[]): void;
  drawRect(rect: Float32Array | number[], paint: SkiaPaintApi): void;
  drawPath(path: SkiaPathApi, paint: SkiaPaintApi): void;
  drawImageRect(
    image: SkiaImageApi,
    src: [number, number, number, number],
    dest: [number, number, number, number],
    paint: SkiaPaintApi,
    fastSample?: boolean,
  ): void;
}
