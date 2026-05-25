import {
  buildSVGPath,
  Container,
  Graphics,
  Sprite,
  type Container as PixiContainer,
  type ConvertedStrokeStyle,
  type GraphicsInstructions,
} from 'pixi.js';

import type { SkiaCanvasApi, SkiaCanvasKitApi, SkiaPathApi, SkiaRendererOptions } from '../../types';

import { DEFAULT_CANVAS_BACKGROUND, SVG_PATH_PRECISION } from './constants';
import { SkiaPaintStyles } from './color';
import { SkiaCanvasTransform } from './matrix';

type FillInstruction = Extract<GraphicsInstructions, { action: 'fill' | 'cut' }>;
type StrokeInstruction = Extract<GraphicsInstructions, { action: 'stroke' }>;

/** Draws a Pixi container tree onto any Skia canvas (preview, PDF page, etc.). */
export class PixiSceneDrawer {
  private readonly canvasTransform: SkiaCanvasTransform;
  private readonly paintStyles: SkiaPaintStyles;

  constructor(
    private readonly canvasKit: SkiaCanvasKitApi,
    private readonly options: SkiaRendererOptions,
  ) {
    this.canvasTransform = new SkiaCanvasTransform(canvasKit);
    this.paintStyles = new SkiaPaintStyles(canvasKit);
  }

  draw(container: Container, canvas: SkiaCanvasApi): void {
    const { width, height, background = DEFAULT_CANVAS_BACKGROUND } = this.options;

    this.canvasTransform.clearCanvas(canvas, width, height, background);

    let root: Container | null = container;
    while (root.parent) {
      root = root.parent;
    }
    root.updateTransform({});

    this.walkScene(canvas, container);
  }

  private walkScene(canvas: SkiaCanvasApi, node: PixiContainer): void {
    if (!node.visible || node.groupAlpha <= 0) {
      return;
    }

    const alpha = node.groupAlpha;

    canvas.save();
    this.canvasTransform.concatGroupTransform(canvas, node);

    if (node instanceof Graphics) {
      this.renderGraphics(canvas, node, alpha);
    } else if (node instanceof Sprite) {
      this.renderSprite(canvas, node, alpha);
    }

    canvas.restore();

    for (const child of node.children) {
      this.walkScene(canvas, child as PixiContainer);
    }
  }

  private renderGraphics(canvas: SkiaCanvasApi, graphics: Graphics, alpha: number): void {
    const instructions = graphics.context.instructions as GraphicsInstructions[];

    for (const instruction of instructions) {
      if (instruction.action === 'fill' || instruction.action === 'cut') {
        this.drawFill(canvas, instruction as FillInstruction, alpha);
      } else if (instruction.action === 'stroke') {
        this.drawStroke(canvas, instruction as StrokeInstruction, alpha);
      }
    }
  }

  private drawFill(canvas: SkiaCanvasApi, instruction: FillInstruction, alpha: number): void {
    const path = this.buildSkPath(instruction.data.path);
    if (!path) {
      return;
    }

    const paint = new this.canvasKit.Paint();
    this.paintStyles.applyFillPaint(paint, instruction.data.style.color, instruction.data.style.alpha * alpha);
    canvas.drawPath(path, paint);
    paint.delete();
    path.delete();
  }

  private drawStroke(canvas: SkiaCanvasApi, instruction: StrokeInstruction, alpha: number): void {
    const path = this.buildSkPath(instruction.data.path);
    if (!path) {
      return;
    }

    const style = instruction.data.style as ConvertedStrokeStyle;
    const paint = new this.canvasKit.Paint();

    this.paintStyles.applyStrokePaint(paint, style.color, style.alpha * alpha, style);

    canvas.drawPath(path, paint);
    paint.delete();
    path.delete();
  }

  private buildSkPath(graphicsPath: FillInstruction['data']['path']): SkiaPathApi | null {
    const svgPath = buildSVGPath(graphicsPath, SVG_PATH_PRECISION);
    if (!svgPath) {
      return null;
    }
    return this.canvasKit.Path.MakeFromSVGString(svgPath);
  }

  private renderSprite(canvas: SkiaCanvasApi, sprite: Sprite, alpha: number): void {
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
    const anchorX = sprite.anchor.x * sprite.width;
    const anchorY = sprite.anchor.y * sprite.height;

    const paint = new this.canvasKit.Paint();
    paint.setAlphaf(sprite.alpha * alpha);

    const src: [number, number, number, number] = [
      frame.x,
      frame.y,
      frame.x + frame.width,
      frame.y + frame.height,
    ];
    const dest: [number, number, number, number] = [
      -anchorX,
      -anchorY,
      -anchorX + sprite.width,
      -anchorY + sprite.height,
    ];

    canvas.drawImageRect(skImage, src, dest, paint, false);
    paint.delete();
    skImage.delete();
  }
}
