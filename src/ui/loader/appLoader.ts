import './loader.css';

export class AppLoader {
  private readonly element = document.getElementById('app-loader');

  /** Handles hide logic. */
  hide(): void {
    this.element?.classList.add('app-loader--hidden');
  }
}
