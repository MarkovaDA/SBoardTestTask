import { Container, Graphics } from 'pixi.js-legacy';

import {
  SHAPES_CIRCLE_FILL,
  SHAPES_CIRCLE_RADIUS,
  SHAPES_CIRCLE_X,
  SHAPES_CIRCLE_Y,
  SHAPES_RECT_FILL,
  SHAPES_RECT_HEIGHT,
  SHAPES_RECT_WIDTH,
  SHAPES_RECT_X,
  SHAPES_RECT_Y,
  SHAPES_STAR_FILL,
  SHAPES_STAR_X,
  SHAPES_STAR_Y,
  SHAPES_TRIANGLE_FILL,
  SHAPES_TRIANGLE_SIZE,
  SHAPES_TRIANGLE_X,
  SHAPES_TRIANGLE_Y,
} from './constants';

/** Prepared scene: filled primitives. */
export class ShapesScene {
  build(): Container {
    const root = new Container();

    const circle = new Graphics();
    circle.beginFill(SHAPES_CIRCLE_FILL).drawCircle(0, 0, SHAPES_CIRCLE_RADIUS).endFill();
    circle.position.set(SHAPES_CIRCLE_X, SHAPES_CIRCLE_Y);

    const rect = new Graphics();
    rect.beginFill(SHAPES_RECT_FILL).drawRect(0, 0, SHAPES_RECT_WIDTH, SHAPES_RECT_HEIGHT).endFill();
    rect.position.set(SHAPES_RECT_X, SHAPES_RECT_Y);
    rect.angle = 25;

    const triangle = new Graphics();
    triangle.beginFill(SHAPES_TRIANGLE_FILL).drawPolygon([
      0, -SHAPES_TRIANGLE_SIZE,
      SHAPES_TRIANGLE_SIZE, SHAPES_TRIANGLE_SIZE,
      -SHAPES_TRIANGLE_SIZE, SHAPES_TRIANGLE_SIZE,
    ]).endFill();
    triangle.position.set(SHAPES_TRIANGLE_X, SHAPES_TRIANGLE_Y);

    const star = new Graphics();
    star.beginFill(SHAPES_STAR_FILL).drawPolygon([
      0, -45,
      12, -12,
      45, -12,
      18, 10,
      28, 45,
      0, 22,
      -28, 45,
      -18, 10,
      -45, -12,
      -12, -12,
    ]).endFill();
    star.position.set(SHAPES_STAR_X, SHAPES_STAR_Y);

    root.addChild(circle, rect, triangle, star);
    return root;
  }
}
