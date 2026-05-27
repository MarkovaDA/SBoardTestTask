import { Container, Graphics } from 'pixi.js';

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
      .moveTo(60, 80)
      .lineTo(320, 120)
      .stroke({ width: LINES_SCENE_LINE_WIDTH, color: LINES_SCENE_STROKE_A, alpha: 1 });

    const lineB = new Graphics();
    lineB
      .moveTo(100, 220)
      .lineTo(380, 60)
      .stroke({ width: LINES_SCENE_LINE_WIDTH, color: LINES_SCENE_STROKE_B, alpha: 1 });

    const lineC = new Graphics();
    lineC
      .moveTo(200, 40)
      .lineTo(200, 260)
      .stroke({ width: LINES_SCENE_LINE_WIDTH + 2, color: LINES_SCENE_STROKE_C, alpha: 1 });

    const lineD = new Graphics();
    lineD
      .moveTo(40, 180)
      .lineTo(400, 200)
      .lineTo(280, 280)
      .stroke({ width: LINES_SCENE_LINE_WIDTH, color: LINES_SCENE_STROKE_D, alpha: 1 });

    root.addChild(lineA, lineB, lineC, lineD);
    return root;
  }
}
