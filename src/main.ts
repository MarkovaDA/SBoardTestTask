import './style.css';

import { AppLoader, CanvasPanelLoader } from './ui/loader';

async function bootstrap(): Promise<void> {
  const shellLoader = new AppLoader();
  const canvasLoader = new CanvasPanelLoader();

  shellLoader.hide();

  try {
    const { App } = await import('./core/app');
    await App.create();
  } finally {
    canvasLoader.hide();
  }
}

bootstrap().catch((error: unknown) => {
  console.error(error);
});
