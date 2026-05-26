/** Shared render options (Skia preview and PDF). */
export interface SkiaRendererOptions {
  width: number;
  height: number;
  /** Background fill before drawing (CSS color). Default: #ffffff */
  background?: string;
}
