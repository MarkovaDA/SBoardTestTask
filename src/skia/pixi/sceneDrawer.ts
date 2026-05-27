import {
  Container,
  Graphics,
  Sprite,
  type Container as PixiContainer,
  type Matrix,
} from 'pixi.js-legacy';

import type { SkiaCanvasApi, SkiaCanvasKitApi, SkiaPathApi, SkiaRendererOptions } from '../../types';

import { DEFAULT_CANVAS_BACKGROUND } from './constants';
import { SkiaPaintStyles } from './color';
import { SkiaCanvasTransformer } from './skiaCanvasTransformer';

type FillInstruction = { data: { path: unknown; style: { color: unknown; alpha: number } } };
type StrokeInstruction = {
  data: {
    path: unknown;
    style: { color: unknown; alpha: number; width?: number; cap?: unknown; join?: unknown };
  };
};

/** Draws a Pixi container tree onto any Skia canvas (preview, PDF page, etc.). */
export class PixiSceneDrawer {
  private readonly canvasTransform: SkiaCanvasTransformer;
  private readonly paintStyles: SkiaPaintStyles;

  constructor(
    private readonly canvasKit: SkiaCanvasKitApi,
    private readonly options: SkiaRendererOptions,
  ) {
    this.canvasTransform = new SkiaCanvasTransformer(canvasKit);
    this.paintStyles = new SkiaPaintStyles(canvasKit);
  }

  draw(container: Container, canvas: SkiaCanvasApi): void {
    const { width, height, background = DEFAULT_CANVAS_BACKGROUND } = this.options;

    this.canvasTransform.clearCanvas(canvas, width, height, background);

    this.walkScene(canvas, container);
  }

  private walkScene(canvas: SkiaCanvasApi, node: PixiContainer): void {
    const alpha = (node as unknown as { worldAlpha?: number; groupAlpha?: number }).worldAlpha
      ?? (node as unknown as { worldAlpha?: number; groupAlpha?: number }).groupAlpha
      ?? node.alpha;

    if (!node.visible || alpha <= 0) {
      return;
    }

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
    const instructions = (graphics as unknown as { context?: { instructions?: unknown } }).context?.instructions;

    if (Array.isArray(instructions) && instructions.length > 0) {
      for (const instruction of instructions) {
        if (instruction.action === 'fill' || instruction.action === 'cut') {
          this.drawFill(canvas, instruction as FillInstruction, alpha);
        } else if (instruction.action === 'stroke') {
          this.drawStroke(canvas, instruction as StrokeInstruction, alpha);
        }
      }
      return;
    }

    const geometryData = (graphics as unknown as { geometry?: { graphicsData?: unknown } }).geometry?.graphicsData;
    if (!Array.isArray(geometryData)) {
      return;
    }

    for (const data of geometryData) {
      this.drawLegacyGraphicsData(canvas, data as LegacyGraphicsData, alpha);
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

    const style = instruction.data.style;
    const paint = new this.canvasKit.Paint();

    this.paintStyles.applyStrokePaint(
      paint,
      style.color,
      style.alpha * alpha,
      { width: style.width, cap: style.cap as string | undefined, join: style.join as string | undefined },
    );

    canvas.drawPath(path, paint);
    paint.delete();
    path.delete();
  }

  private buildSkPath(graphicsPath: FillInstruction['data']['path']): SkiaPathApi | null {
    const svgPath = this.tryBuildSvgPath(graphicsPath);
    
    if (!svgPath) {
      return null;
    }

    return this.canvasKit.Path.MakeFromSVGString(svgPath);
  }

  private tryBuildSvgPath(graphicsPath: unknown): string | null {
    if (typeof graphicsPath === 'string') {
      return graphicsPath;
    }

    if (
      graphicsPath
      && typeof graphicsPath === 'object'
      && 'toString' in graphicsPath
      && typeof (graphicsPath as { toString: () => string }).toString === 'function'
    ) {
      const value = (graphicsPath as { toString: () => string }).toString();
      return value && value !== '[object Object]' ? value : null;
    }

    return null;
  }

  private drawLegacyGraphicsData(canvas: SkiaCanvasApi, data: LegacyGraphicsData, alpha: number): void {
    if (!data.shape) {
      return;
    }

    const svgPath = this.buildSvgPathFromLegacyShape(data.shape);
    if (!svgPath) {
      return;
    }

    const path = this.canvasKit.Path.MakeFromSVGString(svgPath);
    if (!path) {
      return;
    }

    const fill = data.fillStyle;
    const line = data.lineStyle;
    const hasFill = Boolean(fill && (fill.visible ?? true) && (fill.alpha ?? 1) > 0);
    const hasStroke = Boolean(line && (line.visible ?? true) && (line.width ?? 0) > 0 && (line.alpha ?? 1) > 0);

    canvas.save();
    if (data.matrix) {
      this.canvasTransform.concatPixiMatrix(canvas, data.matrix as unknown as Matrix);
    }

    if (hasFill) {
      const paint = new this.canvasKit.Paint();
      this.paintStyles.applyFillPaint(paint, fill?.color ?? 0x000000, (fill?.alpha ?? 1) * alpha);
      canvas.drawPath(path, paint);
      paint.delete();
    }

    if (hasStroke) {
      const paint = new this.canvasKit.Paint();
      this.paintStyles.applyStrokePaint(
        paint,
        line?.color ?? 0x000000,
        (line?.alpha ?? 1) * alpha,
        {
          width: line?.width,
          cap: line?.cap as string | undefined,
          join: line?.join as string | undefined,
          miterLimit: line?.miterLimit,
        },
      );
      canvas.drawPath(path, paint);
      paint.delete();
    }

    canvas.restore();
    path.delete();
  }

  private buildSvgPathFromLegacyShape(shape: LegacyShape): string | null {
    if (!shape) {
      return null;
    }

    const shapeType = shape.type;

    if (shapeType === LEGACY_SHAPE.CIRC && this.isNumber(shape.radius) && this.isNumber(shape.x) && this.isNumber(shape.y)) {
      const r = Math.abs(shape.radius);
      if (r <= 0) {
        return null;
      }
      const x = shape.x;
      const y = shape.y;
      return `M ${this.fmt(x - r)} ${this.fmt(y)} A ${this.fmt(r)} ${this.fmt(r)} 0 1 0 ${this.fmt(x + r)} ${this.fmt(y)} A ${this.fmt(r)} ${this.fmt(r)} 0 1 0 ${this.fmt(x - r)} ${this.fmt(y)} Z`;
    }

    if (
      shapeType === LEGACY_SHAPE.RREC
      && this.isNumber(shape.width)
      && this.isNumber(shape.height)
      && this.isNumber(shape.x)
      && this.isNumber(shape.y)
    ) {
      const x = shape.x;
      const y = shape.y;
      const w = shape.width;
      const h = shape.height;
      const r = Math.min(Math.abs(shape.radius ?? 0), Math.abs(w) / 2, Math.abs(h) / 2);
      return `M ${this.fmt(x + r)} ${this.fmt(y)} L ${this.fmt(x + w - r)} ${this.fmt(y)} A ${this.fmt(r)} ${this.fmt(r)} 0 0 1 ${this.fmt(x + w)} ${this.fmt(y + r)} L ${this.fmt(x + w)} ${this.fmt(y + h - r)} A ${this.fmt(r)} ${this.fmt(r)} 0 0 1 ${this.fmt(x + w - r)} ${this.fmt(y + h)} L ${this.fmt(x + r)} ${this.fmt(y + h)} A ${this.fmt(r)} ${this.fmt(r)} 0 0 1 ${this.fmt(x)} ${this.fmt(y + h - r)} L ${this.fmt(x)} ${this.fmt(y + r)} A ${this.fmt(r)} ${this.fmt(r)} 0 0 1 ${this.fmt(x + r)} ${this.fmt(y)} Z`;
    }

    if (
      shapeType === LEGACY_SHAPE.RECT
      && this.isNumber(shape.width)
      && this.isNumber(shape.height)
      && this.isNumber(shape.x)
      && this.isNumber(shape.y)
    ) {
      const x = shape.x;
      const y = shape.y;
      const w = shape.width;
      const h = shape.height;
      return `M ${this.fmt(x)} ${this.fmt(y)} L ${this.fmt(x + w)} ${this.fmt(y)} L ${this.fmt(x + w)} ${this.fmt(y + h)} L ${this.fmt(x)} ${this.fmt(y + h)} Z`;
    }

    if (
      shapeType === LEGACY_SHAPE.ELIP
      && this.isNumber(shape.width)
      && this.isNumber(shape.height)
      && this.isNumber(shape.x)
      && this.isNumber(shape.y)
    ) {
      const rx = Math.abs(shape.width);
      const ry = Math.abs(shape.height);
      if (rx <= 0 || ry <= 0) {
        return null;
      }
      const x = shape.x;
      const y = shape.y;
      return `M ${this.fmt(x - rx)} ${this.fmt(y)} A ${this.fmt(rx)} ${this.fmt(ry)} 0 1 0 ${this.fmt(x + rx)} ${this.fmt(y)} A ${this.fmt(rx)} ${this.fmt(ry)} 0 1 0 ${this.fmt(x - rx)} ${this.fmt(y)} Z`;
    }

    if (Array.isArray(shape.points) && shape.points.length >= 2) {
      return this.svgPathFromPoints(shape.points, Boolean(shape.closeStroke ?? shape.closed ?? shape.closePath));
    }

    if (this.isNumber(shape.width) && this.isNumber(shape.height) && this.isNumber(shape.x) && this.isNumber(shape.y)) {
      const x = shape.x;
      const y = shape.y;
      const w = shape.width;
      const h = shape.height;
      return `M ${this.fmt(x)} ${this.fmt(y)} L ${this.fmt(x + w)} ${this.fmt(y)} L ${this.fmt(x + w)} ${this.fmt(y + h)} L ${this.fmt(x)} ${this.fmt(y + h)} Z`;
    }

    return null;
  }

  private svgPathFromPoints(points: number[], close: boolean): string | null {
    if (points.length < 4) {
      return null;
    }

    const cleaned: number[] = [];
    for (let i = 0; i + 1 < points.length; i += 2) {
      const x = points[i] ?? 0;
      const y = points[i + 1] ?? 0;
      const prevX = cleaned[cleaned.length - 2];
      const prevY = cleaned[cleaned.length - 1];
      if (prevX === x && prevY === y) {
        continue;
      }
      cleaned.push(x, y);
    }

    if (cleaned.length < 4) {
      return null;
    }

    let path = `M ${this.fmt(cleaned[0] ?? 0)} ${this.fmt(cleaned[1] ?? 0)}`;
    for (let i = 2; i + 1 < cleaned.length; i += 2) {
      path += ` L ${this.fmt(cleaned[i] ?? 0)} ${this.fmt(cleaned[i + 1] ?? 0)}`;
    }

    if (close) {
      path += ' Z';
    }
    return path;
  }

  private fmt(value: number): string {
    return Number.isFinite(value) ? Number(value.toFixed(3)).toString() : '0';
  }

  private isNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
  }

  private renderSprite(canvas: SkiaCanvasApi, sprite: Sprite, alpha: number): void {
    const texture = sprite.texture;
    const source = (texture as unknown as { source?: unknown; baseTexture?: { resource?: { source?: unknown } } })
      .source
      ?? (texture as unknown as { source?: unknown; baseTexture?: { resource?: { source?: unknown } } })
        .baseTexture?.resource?.source;

    if (
      texture.width <= 0
      || texture.height <= 0
      || !source
      || (source as { width?: number }).width === undefined
      || (source as { height?: number }).height === undefined
      || (source as { width: number }).width <= 0
      || (source as { height: number }).height <= 0
    ) {
      return;
    }

    const resource = ((source as { resource?: CanvasImageSource }).resource
      ?? source) as CanvasImageSource | undefined;
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

type LegacyShape = {
  type?: number;
  points?: number[];
  closeStroke?: boolean;
  closed?: boolean;
  closePath?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
};

const LEGACY_SHAPE = {
  POLY: 0,
  RECT: 1,
  CIRC: 2,
  ELIP: 3,
  RREC: 4,
} as const;

type LegacyGraphicsData = {
  shape?: LegacyShape;
  matrix?: { a: number; b: number; c: number; d: number; tx: number; ty: number };
  fillStyle?: { visible?: boolean; alpha?: number; color?: unknown };
  lineStyle?: {
    visible?: boolean;
    alpha?: number;
    width?: number;
    color?: unknown;
    cap?: unknown;
    join?: unknown;
    miterLimit?: number;
  };
};

