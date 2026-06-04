import type { Graphics } from 'pixi.js-legacy';

/** Draws one random primitive kind onto prepared Graphics (Strategy abstraction). */
export interface RandomShapeStrategy {
  draw(graphics: Graphics): void;
}
