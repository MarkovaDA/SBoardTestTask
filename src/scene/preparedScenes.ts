import type { Container } from 'pixi.js';

import { DemoScene } from './demoScene';
import { LinesScene } from './linesScene';
import { ShapesScene } from './shapesScene';

export interface PreparedSceneEntry {
  readonly label: string;
  readonly container: Container;
}

/** Builds all preset scenes once and keeps them for switching. */
export class PreparedScenes {
  readonly entries: readonly PreparedSceneEntry[];

  constructor() {
    this.entries = [
      { label: 'Демо (ТЗ)', container: new DemoScene().build() },
      { label: 'Фигуры', container: new ShapesScene().build() },
      { label: 'Линии', container: new LinesScene().build() },
    ];
  }
}
