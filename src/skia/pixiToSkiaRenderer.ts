import type { Canvas, CanvasKit, Path, Surface } from 'canvaskit-wasm';
import {
  buildSVGPath,
  Container,
  Graphics,
  Sprite,
  type Container as PixiContainer,
  type ConvertedStrokeStyle,
  type GraphicsInstructions,
} from 'pixi.js';
import { applyFillPaint, applyStrokePaint } from './color';
import { clearCanvas, concatPixiMatrix } from './matrix';
import type { ISkiaRenderer, SkiaRenderTarget, SkiaRendererOptions } from './types';

type FillInstruction = Extract<GraphicsInstructions, { action: 'fill' | 'cut' }>;
type StrokeInstruction = Extract<GraphicsInstructions, { action: 'stroke' }>;

export class PixiToSkiaRenderer implements ISkiaRenderer {
  constructor(
    readonly canvasKit: CanvasKit,
    private readonly options: SkiaRendererOptions,
  ) {}

  render(container: Container, target: SkiaRenderTarget): void {
    const surface = this.resolveSurface(target);
    const canvas = surface.getCanvas();
    const { width, height, background = '#ffffff' } = this.options;

    clearCanvas(this.canvasKit, canvas, width, height, background);

    let root: Container | null = container;
    
    while (root.parent) {
      root = root.parent;
    }

    root.updateTransform({});

    this.walkScene(canvas, container, 1);

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

  private walkScene(canvas: Canvas, node: PixiContainer, inheritedAlpha: number): void {
    const alpha = inheritedAlpha * node.alpha;
    if (!node.visible || alpha <= 0) {
      return;
    }

    canvas.save();
    concatPixiMatrix(canvas, node.localTransform);

    if (node instanceof Graphics) {
      this.renderGraphics(canvas, node, alpha);
    } else if (node instanceof Sprite) {
      this.renderSprite(canvas, node, alpha);
    }

    for (const child of node.children) {
      this.walkScene(canvas, child as PixiContainer, alpha);
    }

    canvas.restore();
  }

  private renderGraphics(canvas: Canvas, graphics: Graphics, alpha: number): void {
    const instructions = graphics.context.instructions as GraphicsInstructions[];

    for (const instruction of instructions) {
      if (instruction.action === 'fill' || instruction.action === 'cut') {
        this.drawFill(canvas, instruction as FillInstruction, alpha);
      } else if (instruction.action === 'stroke') {
        this.drawStroke(canvas, instruction as StrokeInstruction, alpha);
      }
    }
  }

  private drawFill(canvas: Canvas, instruction: FillInstruction, alpha: number): void {
    const path = this.buildSkPath(instruction.data.path);
    if (!path) {
      return;
    }

    const paint = new this.canvasKit.Paint();
    applyFillPaint(this.canvasKit, paint, instruction.data.style.color, instruction.data.style.alpha * alpha);
    canvas.drawPath(path, paint);
    paint.delete();
    path.delete();
  }

  private drawStroke(canvas: Canvas, instruction: StrokeInstruction, alpha: number): void {
    const path = this.buildSkPath(instruction.data.path);
    if (!path) {
      return;
    }

    const style = instruction.data.style as ConvertedStrokeStyle;
    const paint = new this.canvasKit.Paint();
    
    applyStrokePaint(
      this.canvasKit,
      paint,
      style.color,
      style.alpha * alpha,
      style.width ?? 1,
    );

    canvas.drawPath(path, paint);
    paint.delete();
    path.delete();
  }

  private buildSkPath(graphicsPath: FillInstruction['data']['path']): Path | null {
    const svgPath = buildSVGPath(graphicsPath, 2);
    if (!svgPath) {
      return null;
    }
    return this.canvasKit.Path.MakeFromSVGString(svgPath);
  }

  private renderSprite(canvas: Canvas, sprite: Sprite, alpha: number): void {
    const texture = sprite.texture;
    const source = texture.source;

    if (texture.width <= 0 || texture.height <= 0 || source.width <= 0 || source.height <= 0) {
      return;
    }

    const resource = source.resource as CanvasImageSource | undefined;
    
    if (!resource) {
      return;
    }

    let skImage;
    
    try {
      skImage = this.canvasKit.MakeImageFromCanvasImageSource(resource);
    } catch {
      return;
    }

    const frame = texture.frame;
    const sx = frame.x;
    const sy = frame.y;
    const sw = frame.width;
    const sh = frame.height;

    const anchorX = sprite.anchor.x * sprite.width;
    const anchorY = sprite.anchor.y * sprite.height;
    const dx = -anchorX;
    const dy = -anchorY;
    const dw = sprite.width;
    const dh = sprite.height;

    const paint = new this.canvasKit.Paint();
    paint.setAlphaf(sprite.alpha * alpha);

    const src: [number, number, number, number] = [sx, sy, sx + sw, sy + sh];
    const dest: [number, number, number, number] = [dx, dy, dx + dw, dy + dh];

    canvas.drawImageRect(skImage, src, dest, paint, false);
    paint.delete();
    skImage.delete();
  }
}
