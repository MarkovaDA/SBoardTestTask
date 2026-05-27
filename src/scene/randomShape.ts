import { Container, Graphics } from 'pixi.js';

import {
  RANDOM_SHAPE_ANGLE_OFFSET,
  RANDOM_SHAPE_ANGLE_RANGE,
  RANDOM_SHAPE_ELLIPSE_RADIUS_X_MIN,
  RANDOM_SHAPE_ELLIPSE_RADIUS_X_RANGE,
  RANDOM_SHAPE_ELLIPSE_RADIUS_Y_MIN,
  RANDOM_SHAPE_ELLIPSE_RADIUS_Y_RANGE,
  RANDOM_SHAPE_FILL_COLORS,
  RANDOM_SHAPE_KIND_COUNT,
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
  RANDOM_SHAPE_SCALE_MIN,
  RANDOM_SHAPE_SCALE_RANGE,
  RANDOM_SHAPE_STROKE_COLORS,
  RANDOM_SHAPE_TRIANGLE_HALF_WIDTH,
  RANDOM_SHAPE_TRIANGLE_HEIGHT,
  RANDOM_SHAPE_TRIANGLE_LINE_WIDTH,
  RANDOM_SHAPE_X_MIN,
  RANDOM_SHAPE_X_RANGE,
  RANDOM_SHAPE_Y_MIN,
  RANDOM_SHAPE_Y_RANGE,
} from './constants';

export class RandomShapeFactory {
  addTo(container: Container): Graphics {
    const g = new Graphics();
    const x = RANDOM_SHAPE_X_MIN + Math.random() * RANDOM_SHAPE_X_RANGE;
    const y = RANDOM_SHAPE_Y_MIN + Math.random() * RANDOM_SHAPE_Y_RANGE;
    const angle = Math.random() * RANDOM_SHAPE_ANGLE_RANGE + RANDOM_SHAPE_ANGLE_OFFSET;
    const scale = RANDOM_SHAPE_SCALE_MIN + Math.random() * RANDOM_SHAPE_SCALE_RANGE;

    g.position.set(x, y);
    g.angle = angle;
    g.scale.set(scale, scale);

    const kind = Math.floor(Math.random() * RANDOM_SHAPE_KIND_COUNT);

    switch (kind) {
      case 0:
        g.ellipse(
          0,
          0,
          RANDOM_SHAPE_ELLIPSE_RADIUS_X_MIN + Math.random() * RANDOM_SHAPE_ELLIPSE_RADIUS_X_RANGE,
          RANDOM_SHAPE_ELLIPSE_RADIUS_Y_MIN + Math.random() * RANDOM_SHAPE_ELLIPSE_RADIUS_Y_RANGE,
        ).fill({
          color: RANDOM_SHAPE_FILL_COLORS[Math.floor(Math.random() * RANDOM_SHAPE_FILL_COLORS.length)]!,
        });
        break;
      case 1:
        g.rect(
          RANDOM_SHAPE_RECT_X_MIN + Math.random() * RANDOM_SHAPE_RECT_X_RANGE,
          RANDOM_SHAPE_RECT_Y_MIN + Math.random() * RANDOM_SHAPE_RECT_Y_RANGE,
          RANDOM_SHAPE_RECT_WIDTH_MIN + Math.random() * RANDOM_SHAPE_RECT_WIDTH_RANGE,
          RANDOM_SHAPE_RECT_HEIGHT_MIN + Math.random() * RANDOM_SHAPE_RECT_HEIGHT_RANGE,
        ).fill({
          color: RANDOM_SHAPE_FILL_COLORS[Math.floor(Math.random() * RANDOM_SHAPE_FILL_COLORS.length)]!,
        });
        break;
      case 2:
        g.moveTo(0, 0)
          .lineTo(
            RANDOM_SHAPE_LINE_LENGTH_MIN + Math.random() * RANDOM_SHAPE_LINE_LENGTH_RANGE,
            Math.random() * RANDOM_SHAPE_LINE_Y_RANGE + RANDOM_SHAPE_LINE_Y_OFFSET,
          )
          .stroke({
            width: RANDOM_SHAPE_LINE_WIDTH_MIN + Math.random() * RANDOM_SHAPE_LINE_WIDTH_RANGE,
            color: RANDOM_SHAPE_STROKE_COLORS[Math.floor(Math.random() * RANDOM_SHAPE_STROKE_COLORS.length)]!,
            alpha: 1,
          });
        break;
      default:
        g.moveTo(-RANDOM_SHAPE_TRIANGLE_HALF_WIDTH, 0)
          .lineTo(RANDOM_SHAPE_TRIANGLE_HALF_WIDTH, 0)
          .lineTo(0, RANDOM_SHAPE_TRIANGLE_HEIGHT)
          .lineTo(-RANDOM_SHAPE_TRIANGLE_HALF_WIDTH, 0)
          .stroke({
            width: RANDOM_SHAPE_TRIANGLE_LINE_WIDTH,
            color: RANDOM_SHAPE_STROKE_COLORS[Math.floor(Math.random() * RANDOM_SHAPE_STROKE_COLORS.length)]!,
            alpha: 1,
          });
        break;
    }

    container.addChild(g);
    return g;
  }
}
