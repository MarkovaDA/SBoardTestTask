export type DomElements = {
  pixiContainer: HTMLElement;
  skiaCanvas: HTMLCanvasElement;
  exportBtn: HTMLButtonElement;
  randomBtn: HTMLButtonElement;
  clearBtn: HTMLButtonElement;
  autoSceneBtn: HTMLButtonElement;
  sceneButtons: HTMLButtonElement[];
};

/** Resolves required DOM nodes for application bootstrap. */
export function collectDom(sceneCount: number): DomElements {
  const pixiContainer = document.getElementById('pixi-container');
  const skiaCanvas = document.getElementById('skia-canvas');
  const exportBtn = document.getElementById('btn-export-pdf');
  const randomBtn = document.getElementById('btn-random-shape');
  const clearBtn = document.getElementById('btn-clear-canvas');
  const autoSceneBtn = document.getElementById('btn-scene-auto');

  if (!pixiContainer || !(skiaCanvas instanceof HTMLCanvasElement)) {
    throw new Error('Required DOM elements not found');
  }

  if (
    !(exportBtn instanceof HTMLButtonElement)
    || !(randomBtn instanceof HTMLButtonElement)
    || !(clearBtn instanceof HTMLButtonElement)
    || !(autoSceneBtn instanceof HTMLButtonElement)
  ) {
    throw new Error('Control panel buttons not found');
  }

  const sceneButtons: HTMLButtonElement[] = [];

  for (let index = 0; index < sceneCount; index += 1) {
    const button = document.getElementById(`btn-scene-${index}`);

    if (!(button instanceof HTMLButtonElement)) {
      throw new Error(`Scene button btn-scene-${index} not found`);
    }

    sceneButtons.push(button);
  }

  return {
    pixiContainer,
    skiaCanvas,
    exportBtn,
    randomBtn,
    clearBtn,
    autoSceneBtn,
    sceneButtons,
  };
}
