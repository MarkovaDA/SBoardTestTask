import type { CanvasKit, Surface } from 'canvaskit-wasm';
import type { Container } from 'pixi.js';
import type { SkiaCanvasApi, SkiaCanvasKitApi } from '../types';
import type { SkiaRendererOptions } from '../types';
import { commitPendingStrokes } from './commitPendingStrokes';
import { PixiSceneDrawer } from './pixiSceneDrawer';
import type { ISkiaRenderer, SkiaRenderTarget } from './types';

export class PixiToSkiaRenderer implements ISkiaRenderer {
  private readonly drawer: PixiSceneDrawer;

  constructor(
    readonly canvasKit: CanvasKit,
    options: SkiaRendererOptions,
  ) {
    this.drawer = new PixiSceneDrawer(canvasKit as unknown as SkiaCanvasKitApi, options);
  }

  get sceneDrawer(): PixiSceneDrawer {
    return this.drawer;
  }

  render(container: Container, target: SkiaRenderTarget): void {
    commitPendingStrokes(container);

    const surface = this.resolveSurface(target);
    const canvas = surface.getCanvas();

    this.drawer.draw(container, canvas as unknown as SkiaCanvasApi);
    surface.flush();
  }

  private resolveSurface(target: SkiaRenderTarget): Surface {
    if (target.kind === 'surface') {
      return target.surface;
    }

    const surface = this.canvasKit.MakeCanvasSurface(target.canvas);
    
    if (!surface) {
      throw new Error('Failed to create Skia canvas surface');
    }

    return surface;
  }
}
