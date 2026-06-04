import type { Graphics } from 'pixi.js-legacy';

import {
  RANDOM_SHAPE_ELLIPSE_RADIUS_X_MIN,
  RANDOM_SHAPE_ELLIPSE_RADIUS_X_RANGE,
  RANDOM_SHAPE_ELLIPSE_RADIUS_Y_MIN,
  RANDOM_SHAPE_ELLIPSE_RADIUS_Y_RANGE,
  RANDOM_SHAPE_FILL_COLORS,
  RANDOM_SHAPE_LINE_LENGTH_MIN,
  RANDOM_SHAPE_LINE_LENGTH_RANGE,
  RANDOM_SHAPE_LINE_WIDTH_MIN,
  RANDOM_SHAPE_LINE_WIDTH_RANGE,
  RANDOM_SHAPE_LINE_Y_OFFSET,
  RANDOM_SHAPE_LINE_Y_RANGE,
  RANDOM_SHAPE_RECT_HEIGHT_MIN,
  RANDOM_SHAPE_RECT_HEIGHT_RANGE,
  RANDOM_SHAPE_RECT_WIDTH_MIN,
  RANDOM_SHAPE_RECT_WIDTH_RANGE,
  RANDOM_SHAPE_RECT_X_MIN,
  RANDOM_SHAPE_RECT_X_RANGE,
  RANDOM_SHAPE_RECT_Y_MIN,
  RANDOM_SHAPE_RECT_Y_RANGE,
  RANDOM_SHAPE_STROKE_COLORS,
  RANDOM_SHAPE_TRIANGLE_HALF_WIDTH,
  RANDOM_SHAPE_TRIANGLE_HEIGHT,
  RANDOM_SHAPE_TRIANGLE_LINE_WIDTH,
} from './constants';
import type { RandomShapeStrategy } from './randomShapeStrategy';

const pickFillColor = (): (typeof RANDOM_SHAPE_FILL_COLORS)[number] =>
  RANDOM_SHAPE_FILL_COLORS[Math.floor(Math.random() * RANDOM_SHAPE_FILL_COLORS.length)]!;

const pickStrokeColor = (): (typeof RANDOM_SHAPE_STROKE_COLORS)[number] =>
  RANDOM_SHAPE_STROKE_COLORS[Math.floor(Math.random() * RANDOM_SHAPE_STROKE_COLORS.length)]!;

class EllipseRandomShapeStrategy implements RandomShapeStrategy {
  draw(graphics: Graphics): void {
    graphics
      .beginFill(pickFillColor())
      .drawEllipse(
        0,
        0,
        RANDOM_SHAPE_ELLIPSE_RADIUS_X_MIN + Math.random() * RANDOM_SHAPE_ELLIPSE_RADIUS_X_RANGE,
        RANDOM_SHAPE_ELLIPSE_RADIUS_Y_MIN + Math.random() * RANDOM_SHAPE_ELLIPSE_RADIUS_Y_RANGE,
      )
      .endFill();
  }
}

class RectRandomShapeStrategy implements RandomShapeStrategy {
  draw(graphics: Graphics): void {
    graphics
      .beginFill(pickFillColor())
      .drawRect(
        RANDOM_SHAPE_RECT_X_MIN + Math.random() * RANDOM_SHAPE_RECT_X_RANGE,
        RANDOM_SHAPE_RECT_Y_MIN + Math.random() * RANDOM_SHAPE_RECT_Y_RANGE,
        RANDOM_SHAPE_RECT_WIDTH_MIN + Math.random() * RANDOM_SHAPE_RECT_WIDTH_RANGE,
        RANDOM_SHAPE_RECT_HEIGHT_MIN + Math.random() * RANDOM_SHAPE_RECT_HEIGHT_RANGE,
      )
      .endFill();
  }
}

class LineRandomShapeStrategy implements RandomShapeStrategy {
  draw(graphics: Graphics): void {
    graphics.lineStyle(
      RANDOM_SHAPE_LINE_WIDTH_MIN + Math.random() * RANDOM_SHAPE_LINE_WIDTH_RANGE,
      pickStrokeColor(),
      1,
    );
    graphics
      .moveTo(0, 0)
      .lineTo(
        RANDOM_SHAPE_LINE_LENGTH_MIN + Math.random() * RANDOM_SHAPE_LINE_LENGTH_RANGE,
        Math.random() * RANDOM_SHAPE_LINE_Y_RANGE + RANDOM_SHAPE_LINE_Y_OFFSET,
      );
  }
}

class TriangleRandomShapeStrategy implements RandomShapeStrategy {
  draw(graphics: Graphics): void {
    graphics.lineStyle(RANDOM_SHAPE_TRIANGLE_LINE_WIDTH, pickStrokeColor(), 1);
    graphics
      .moveTo(-RANDOM_SHAPE_TRIANGLE_HALF_WIDTH, 0)
      .lineTo(RANDOM_SHAPE_TRIANGLE_HALF_WIDTH, 0)
      .lineTo(0, RANDOM_SHAPE_TRIANGLE_HEIGHT)
      .lineTo(-RANDOM_SHAPE_TRIANGLE_HALF_WIDTH, 0);
  }
}

export const RANDOM_SHAPE_STRATEGIES: readonly RandomShapeStrategy[] = [
  new EllipseRandomShapeStrategy(),
  new RectRandomShapeStrategy(),
  new LineRandomShapeStrategy(),
  new TriangleRandomShapeStrategy(),
];

export function pickRandomShapeStrategy(): RandomShapeStrategy {
  const index = Math.floor(Math.random() * RANDOM_SHAPE_STRATEGIES.length);
  return RANDOM_SHAPE_STRATEGIES[index]!;
}
