import './style.css';

import { setControlPanelReady } from './ui/control-panel';
import { AppLoader, CanvasPanelLoader } from './ui/loader';

/** Handles register service worker logic. */
function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return;
  }

  const swUrl = `${import.meta.env.BASE_URL}sw.js`;
  void navigator.serviceWorker.register(swUrl).catch((error: unknown) => {
    console.warn('Service worker registration failed:', error);
  });
}

async function bootstrap(): Promise<void> {
  const shellLoader = new AppLoader();
  const canvasLoader = new CanvasPanelLoader();

  setControlPanelReady(false);
  shellLoader.hide();

  try {
    canvasLoader.setMessage('Загрузка модулей…');
    const { App } = await import('./core/app');

    await App.create((message) => {
      canvasLoader.setMessage(message);
    });
  } finally {
    canvasLoader.hide();
  }
}

registerServiceWorker();

bootstrap().catch((error: unknown) => {
  console.error(error);
  setControlPanelReady(true);
});
