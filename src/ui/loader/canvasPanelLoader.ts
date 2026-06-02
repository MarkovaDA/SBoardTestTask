import './loader.css';

export class CanvasPanelLoader {
  private readonly element = document.getElementById('canvas-panels-loader');
  private readonly textElement = this.element?.querySelector('.canvas-panels-loader__text');

  /** Handles set message logic. */
  setMessage(message: string): void {
    if (this.textElement) {
      this.textElement.textContent = message;
    }
  }

  /** Handles hide logic. */
  hide(): void {
    this.element?.classList.add('canvas-panels-loader--hidden');
  }
}
