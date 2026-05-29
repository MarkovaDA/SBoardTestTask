import type { Container } from 'pixi.js-legacy';

import type { SkiaCanvasKitApi } from './skiaCanvasKit';

export type PixiContainer = Container;

/** Renders a Pixi display tree through Skia (CanvasKit). */
export interface ISkiaRenderer {
  readonly canvasKit: SkiaCanvasKitApi;
  convertPixiContainerToSkia(container: Container, skiaCanvas: HTMLCanvasElement): void;
}

export type SkiaRenderTarget =
  | { kind: 'html-canvas'; canvas: HTMLCanvasElement }
  | { kind: 'surface'; surface: unknown };
