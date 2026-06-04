import { Container, Graphics } from 'pixi.js-legacy';

import {
  RANDOM_SHAPE_ANGLE_OFFSET,
  RANDOM_SHAPE_ANGLE_RANGE,
  RANDOM_SHAPE_SCALE_MIN,
  RANDOM_SHAPE_SCALE_RANGE,
  RANDOM_SHAPE_X_MIN,
  RANDOM_SHAPE_X_RANGE,
  RANDOM_SHAPE_Y_MIN,
  RANDOM_SHAPE_Y_RANGE,
} from './constants';
import { pickRandomShapeStrategy } from './randomShapeStrategies';

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

    pickRandomShapeStrategy().draw(g);

    container.addChild(g);
    return g;
  }
}
