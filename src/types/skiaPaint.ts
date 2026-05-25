export interface SkiaPaintApi {
  setColor(color: Float32Array | number[]): void;
  setStyle(style: number): void;
  setAntiAlias(aa: boolean): void;
  setStrokeWidth(width: number): void;
  setStrokeCap(cap: unknown): void;
  setStrokeJoin(join: unknown): void;
  setAlphaf(alpha: number): void;
  delete(): void;
}
