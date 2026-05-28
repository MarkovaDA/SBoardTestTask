import './style.css';

import { App } from './core/app'

class ApplicationEntry {
  async run(): Promise<void> {
    await App.create();
  }
}

new ApplicationEntry().run().catch((error: unknown) => {
  console.error(error);
});
