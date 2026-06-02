import './loader.css';

export class CanvasPanelLoader {
  private readonly element = document.getElementById('canvas-panels-loader');
  private readonly textElement = this.element?.querySelector('.canvas-panels-loader__text');

  setMessage(message: string): void {
    if (this.textElement) {
      this.textElement.textContent = message;
    }
  }

  hide(): void {
    this.element?.classList.add('canvas-panels-loader--hidden');
  }
}
