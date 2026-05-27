import { Container, Graphics } from 'pixi.js';

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

/** Prepared scene: filled primitives (ellipse, rect, triangle, star). */
export class ShapesScene {
  build(): Container {
    const root = new Container();

    const circle = new Graphics();
    circle.circle(0, 0, SHAPES_CIRCLE_RADIUS).fill({ color: SHAPES_CIRCLE_FILL });
    circle.position.set(SHAPES_CIRCLE_X, SHAPES_CIRCLE_Y);

    const rect = new Graphics();
    rect.rect(0, 0, SHAPES_RECT_WIDTH, SHAPES_RECT_HEIGHT).fill({ color: SHAPES_RECT_FILL });
    rect.position.set(SHAPES_RECT_X, SHAPES_RECT_Y);
    rect.angle = 25;

    const triangle = new Graphics();
    triangle
      .poly(
        [
          0, -SHAPES_TRIANGLE_SIZE,
          SHAPES_TRIANGLE_SIZE, SHAPES_TRIANGLE_SIZE,
          -SHAPES_TRIANGLE_SIZE, SHAPES_TRIANGLE_SIZE,
        ],
        true,
      )
      .fill({ color: SHAPES_TRIANGLE_FILL });
    triangle.position.set(SHAPES_TRIANGLE_X, SHAPES_TRIANGLE_Y);

    const star = new Graphics();
    star
      .poly(
        [
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
        ],
        true,
      )
      .fill({ color: SHAPES_STAR_FILL });
    star.position.set(SHAPES_STAR_X, SHAPES_STAR_Y);

    root.addChild(circle, rect, triangle, star);
    return root;
  }
}