import './style.css';

import { App } from './core/app'
import { AppLoader } from './ui/loader';

class ApplicationEntry {
  private readonly loader = new AppLoader();

  run(): void {
    try {
      App.create();
    } finally {
      this.loader.hide();
    }
  }
}

try {
  new ApplicationEntry().run();
} catch (error: unknown) {
  console.error(error);
}
