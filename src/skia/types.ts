/** Shared render options (Skia preview and PDF). */
export interface SkiaRendererOptions {
  width: number;
  height: number;
  /** Background fill before drawing (CSS color). Default: #ffffff */
  background?: string;
}

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

export interface SkiaPathApi {
  delete(): void;
}

export interface SkiaImageApi {
  delete(): void;
}

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
