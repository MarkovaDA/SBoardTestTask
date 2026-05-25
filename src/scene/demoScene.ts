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

/** Demo scene from the task pseudocode. */
export class DemoScene {
  build(): Container {
    const mainContainer = new Container();
    const subContainer = new Container();

    const g1 = new Graphics();
    const g2 = new Graphics();
    const g3 = new Graphics();
    const g4 = new Graphics();

    g1.beginFill(DEMO_G1_FILL).drawEllipse(0, 0, DEMO_G1_ELLIPSE_RX, DEMO_G1_ELLIPSE_RY).endFill();
    g1.position.set(DEMO_G1_X, DEMO_G1_Y);
    g1.angle = DEMO_G1_ANGLE;

    g2.beginFill(DEMO_G2_FILL).drawRect(DEMO_G2_RECT_X, DEMO_G2_RECT_Y, DEMO_G2_RECT_WIDTH, DEMO_G2_RECT_HEIGHT).endFill();
    g2.position.set(DEMO_G2_X, DEMO_G2_Y);
    g2.angle = DEMO_G2_ANGLE;
    g2.scale.set(DEMO_G2_SCALE_X, DEMO_G2_SCALE_Y);

    g3.lineStyle(DEMO_LINE_WIDTH, DEMO_G3_STROKE, 1).moveTo(0, 0).lineTo(DEMO_G3_LINE_END_X, DEMO_G3_LINE_END_Y);
    g3.angle = DEMO_G3_ANGLE;

    g4.lineStyle(DEMO_LINE_WIDTH, DEMO_G4_STROKE, 1).moveTo(0, DEMO_G4_LINE_START_Y).lineTo(DEMO_G4_LINE_END_X, DEMO_G4_LINE_END_Y);
    g4.angle = DEMO_G4_ANGLE;

    subContainer.position.set(DEMO_SUB_CONTAINER_X, DEMO_SUB_CONTAINER_Y);
    subContainer.addChild(g3, g4);
    mainContainer.addChild(subContainer, g1, g2);

    return mainContainer;
  }
}
