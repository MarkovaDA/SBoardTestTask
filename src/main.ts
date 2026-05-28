import './style.css';

import { App } from './core/app'
import { AppLoader } from './ui/loader';

class ApplicationEntry {
  private readonly loader = new AppLoader();

  async run(): Promise<void> {
    try {
      await App.create();
    } finally {
      this.loader.hide();
    }
  }
}

new ApplicationEntry().run().catch((error: unknown) => {
  console.error(error);
});
