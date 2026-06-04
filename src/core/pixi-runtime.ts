import type { Application, Container } from 'pixi.js-legacy';

import type { SkiaRendererOptions } from '../types';
import { CanvasLayout } from './layout';

/** Pixi application, scene slot and viewport sizing. */
export class PixiRuntime {
  private readonly canvasLayout = new CanvasLayout();

  constructor(
    readonly app: Application,
    readonly sceneSlot: Container,
    readonly renderOptions: SkiaRendererOptions,
  ) {}

  get stage(): Container {
    return this.app.stage;
  }

  get view(): HTMLCanvasElement {
    return this.app.view as HTMLCanvasElement;
  }

  render(): void {
    this.app.render();
  }

  resizeFromViewport(): { width: number; height: number } {
    const { width, height } = this.canvasLayout.getViewportCanvasSize();

    this.renderOptions.width = width;
    this.renderOptions.height = height;
    this.app.renderer.resize(width, height);

    return { width, height };
  }
}
