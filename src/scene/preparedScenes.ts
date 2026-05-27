import type { Container } from 'pixi.js-legacy';

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
      { label: 'Р”РµРјРѕ (РўР—)', container: new DemoScene().build() },
      { label: 'Р¤РёРіСѓСЂС‹', container: new ShapesScene().build() },
      { label: 'Р›РёРЅРёРё', container: new LinesScene().build() },
    ];
  }
}

