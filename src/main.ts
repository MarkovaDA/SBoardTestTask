import './style.css';

import { AppLoader } from './ui/loader';

async function bootstrap(): Promise<void> {
  const loader = new AppLoader();

  try {
    const { App } = await import('./core/app');
    await App.create();
  } finally {
    loader.hide();
  }
}

bootstrap().catch((error: unknown) => {
  console.error(error);
});
