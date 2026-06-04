import type { Container } from 'pixi.js-legacy';

/** Builds a preset Pixi scene container (Bridge abstraction). */
export interface SceneBuilder {
  build(): Container;
}

export type SceneBuilderConstructor = new () => SceneBuilder;
