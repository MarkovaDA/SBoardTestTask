import { Container, Graphics } from 'pixi.js-legacy';

import {
  LINES_SCENE_LINE_WIDTH,
  LINES_SCENE_STROKE_A,
  LINES_SCENE_STROKE_B,
  LINES_SCENE_STROKE_C,
  LINES_SCENE_STROKE_D,
} from './constants';

/** Prepared scene: several open strokes (lines). */
export class LinesScene {
  build(): Container {
    const root = new Container();

    const lineA = new Graphics();
    lineA
      .lineStyle(LINES_SCENE_LINE_WIDTH, LINES_SCENE_STROKE_A, 1)
      .moveTo(60, 80)
      .lineTo(320, 120);

    const lineB = new Graphics();
    lineB
      .lineStyle(LINES_SCENE_LINE_WIDTH, LINES_SCENE_STROKE_B, 1)
      .moveTo(100, 220)
      .lineTo(380, 60);

    const lineC = new Graphics();
    lineC
      .lineStyle(LINES_SCENE_LINE_WIDTH + 2, LINES_SCENE_STROKE_C, 1)
      .moveTo(200, 40)
      .lineTo(200, 260);

    const lineD = new Graphics();
    lineD
      .lineStyle(LINES_SCENE_LINE_WIDTH, LINES_SCENE_STROKE_D, 1)
      .moveTo(40, 180)
      .lineTo(400, 200)
      .lineTo(280, 280);

    root.addChild(lineA, lineB, lineC, lineD);
    return root;
  }
}

