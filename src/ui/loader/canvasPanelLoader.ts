import './loader.css';

export class CanvasPanelLoader {
  private readonly element = document.getElementById('canvas-panels-loader');

  hide(): void {
    this.element?.classList.add('canvas-panels-loader--hidden');
  }
}
