import { Container, Graphics } from 'pixi.js';

import {
  DEMO_G1_ANGLE,
  DEMO_G1_ELLIPSE_RX,
  DEMO_G1_ELLIPSE_RY,
  DEMO_G1_FILL,
  DEMO_G1_X,
  DEMO_G1_Y,
  DEMO_G2_ANGLE,
  DEMO_G2_FILL,
  DEMO_G2_RECT_HEIGHT,
  DEMO_G2_RECT_WIDTH,
  DEMO_G2_RECT_X,
  DEMO_G2_RECT_Y,
  DEMO_G2_SCALE_X,
  DEMO_G2_SCALE_Y,
  DEMO_G2_X,
  DEMO_G2_Y,
  DEMO_G3_ANGLE,
  DEMO_G3_LINE_END_X,
  DEMO_G3_LINE_END_Y,
  DEMO_G3_STROKE,
  DEMO_G4_ANGLE,
  DEMO_G4_LINE_END_X,
  DEMO_G4_LINE_END_Y,
  DEMO_G4_LINE_START_Y,
  DEMO_G4_STROKE,
  DEMO_LINE_WIDTH,
  DEMO_SUB_CONTAINER_X,
  DEMO_SUB_CONTAINER_Y,
} from './constants';

/** Demo scene from the task pseudocode (Pixi v8 Graphics API). */
export class DemoScene {
  build(): Container {
    const mainContainer = new Container();
    const subContainer = new Container();

    const g1 = new Graphics();
    const g2 = new Graphics();
    const g3 = new Graphics();
    const g4 = new Graphics();

    g1.ellipse(0, 0, DEMO_G1_ELLIPSE_RX, DEMO_G1_ELLIPSE_RY).fill({ color: DEMO_G1_FILL });
    g1.position.set(DEMO_G1_X, DEMO_G1_Y);
    g1.angle = DEMO_G1_ANGLE;

    g2.rect(DEMO_G2_RECT_X, DEMO_G2_RECT_Y, DEMO_G2_RECT_WIDTH, DEMO_G2_RECT_HEIGHT).fill({ color: DEMO_G2_FILL });
    g2.position.set(DEMO_G2_X, DEMO_G2_Y);
    g2.angle = DEMO_G2_ANGLE;
    g2.scale.set(DEMO_G2_SCALE_X, DEMO_G2_SCALE_Y);

    g3
      .moveTo(0, 0)
      .lineTo(DEMO_G3_LINE_END_X, DEMO_G3_LINE_END_Y)
      .stroke({ width: DEMO_LINE_WIDTH, color: DEMO_G3_STROKE, alpha: 1 });
    g3.angle = DEMO_G3_ANGLE;

    g4
      .moveTo(0, DEMO_G4_LINE_START_Y)
      .lineTo(DEMO_G4_LINE_END_X, DEMO_G4_LINE_END_Y)
      .stroke({ width: DEMO_LINE_WIDTH, color: DEMO_G4_STROKE, alpha: 1 });
    g4.angle = DEMO_G4_ANGLE;

    subContainer.position.set(DEMO_SUB_CONTAINER_X, DEMO_SUB_CONTAINER_Y);
    subContainer.addChild(g3, g4);
    mainContainer.addChild(subContainer, g1, g2);

    return mainContainer;
  }
}
