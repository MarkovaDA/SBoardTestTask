import type { Container } from 'pixi.js';
import type { ISkiaRenderer } from './types';

/**
 * Renders a Pixi container tree onto a Skia HTML canvas (CanvasKit).
 * Call after the Pixi scene graph has up-to-date transforms (e.g. `app.render()`).
 */
export function convertPixiContainerToSkia(
  pixiContainer: Container,
  skiaCanvas: HTMLCanvasElement,
  skiaRenderer: ISkiaRenderer,
): void {
  skiaRenderer.convertPixiContainerToSkia(pixiContainer, skiaCanvas);
}
