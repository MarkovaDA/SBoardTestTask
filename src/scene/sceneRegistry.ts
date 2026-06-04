import type { SceneBuilderConstructor } from './sceneBuilder';

export type SceneRegistryEntry = {
  readonly label: string;
  readonly load: () => Promise<SceneBuilderConstructor>;
};

/** Ordered preset scenes with lazy-loaded builders. */
export const SCENE_REGISTRY: readonly SceneRegistryEntry[] = [
  {
    label: 'Демо (ТЗ)',
    load: async () => (await import('./demoScene')).DemoScene,
  },
  {
    label: 'Фигуры',
    load: async () => (await import('./shapesScene')).ShapesScene,
  },
  {
    label: 'Линии',
    load: async () => (await import('./linesScene')).LinesScene,
  },
];
