import type { CanvasKit, Surface } from 'canvaskit-wasm';
import type { Container } from 'pixi.js';

export type { Container as PixiContainer };

/** Renders a Pixi display tree through Skia (CanvasKit). */
export interface ISkiaRenderer {
  readonly canvasKit: CanvasKit;
  /** `container` must be on a stage with up-to-date transforms. */
  render(container: Container, target: SkiaRenderTarget): void;
}

export type SkiaRenderTarget =
  | { kind: 'html-canvas'; canvas: HTMLCanvasElement }
  | { kind: 'surface'; surface: Surface };

export interface SkiaRendererOptions {
  width: number;
  height: number;
  /** Background fill before drawing (CSS color). Default: #ffffff */
  background?: string;
}
