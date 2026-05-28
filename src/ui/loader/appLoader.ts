import './loader.css';

export class AppLoader {
  private readonly element = document.getElementById('app-loader');

  hide(): void {
    this.element?.classList.add('app-loader--hidden');
  }
}
