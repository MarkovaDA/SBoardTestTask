import type { Container } from 'pixi.js-legacy';

const SCENE_LABELS = ['Демо (ТЗ)', 'Фигуры', 'Линии'] as const;

/** Builds preset scenes on demand and caches them for switching. */
export class PreparedScenes {
  readonly sceneCount = SCENE_LABELS.length;

  private readonly cache: (Container | null)[] = SCENE_LABELS.map(() => null);
  private readonly loading = new Map<number, Promise<Container>>();

  getLabel(index: number): string {
    return SCENE_LABELS[index] ?? `Scene ${index}`;
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
    switch (index) {
      case 0: {
        const { DemoScene } = await import('./demoScene');
        return new DemoScene().build();
      }
      case 1: {
        const { ShapesScene } = await import('./shapesScene');
        return new ShapesScene().build();
      }
      case 2: {
        const { LinesScene } = await import('./linesScene');
        return new LinesScene().build();
      }
      default:
        throw new Error(`Unknown scene index: ${index}`);
    }
  }
}
