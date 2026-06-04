import type { Container } from 'pixi.js-legacy';

import { SCENE_REGISTRY } from './sceneRegistry';

/** Builds preset scenes on demand and caches them for switching. */
export class PreparedScenes {
  readonly sceneCount = SCENE_REGISTRY.length;

  private readonly cache: (Container | null)[] = SCENE_REGISTRY.map(() => null);
  private readonly loading = new Map<number, Promise<Container>>();

  getLabel(index: number): string {
    return SCENE_REGISTRY[index]?.label ?? `Scene ${index}`;
  }

  getScene(index: number): Container {
    const container = this.cache[index];
    if (!container) {
      throw new Error(`Scene ${index} is not loaded yet`);
    }
    return container;
  }

  async ensureScene(index: number): Promise<Container> {
    const cached = this.cache[index];
    if (cached) {
      return cached;
    }

    const pending = this.loading.get(index);
    if (pending) {
      return pending;
    }

    const loadPromise = this.loadScene(index).then((container) => {
      this.cache[index] = container;
      this.loading.delete(index);
      return container;
    });

    this.loading.set(index, loadPromise);
    return loadPromise;
  }

  private async loadScene(index: number): Promise<Container> {
    const entry = SCENE_REGISTRY[index];
    if (!entry) {
      throw new Error(`Unknown scene index: ${index}`);
    }

    const Builder = await entry.load();
    return new Builder().build();
  }
}
