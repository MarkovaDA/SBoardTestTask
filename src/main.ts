import './style.css';
import { App } from './app/App';

async function main(): Promise<void> {
  await App.create();
}

main().catch((error: unknown) => {
  console.error(error);
});
