import './style.css';

import { App } from './app/App';

class ApplicationEntry {
  async run(): Promise<void> {
    await App.create();
  }
}

new ApplicationEntry().run().catch((error: unknown) => {
  console.error(error);
});
