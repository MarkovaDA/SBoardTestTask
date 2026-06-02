const PANEL_SELECTOR = '.control-panel';

class ControlPanelElement extends HTMLElement {
  /** Handles connected callback logic. */
  connectedCallback(): void {
    if (this.dataset.initialized === 'true') {
      return;
    }

    this.dataset.initialized = 'true';
    this.classList.add('control-panel');
    this.setAttribute('role', 'complementary');
    this.setAttribute('aria-label', 'Панель управления');

    this.innerHTML = `
      <h2>ControlPanel</h2>
      <button type="button" id="btn-export-pdf" disabled>Экспорт в PDF</button>
      <button type="button" id="btn-random-shape" disabled>Сгенерировать случайную линию / фигуру</button>
      <button type="button" id="btn-clear-canvas" disabled>Очистить холст</button>
      <div class="scene-switcher" role="group" aria-label="Переключение сцен">
        <span class="scene-switcher__label">Сцены:</span>
        <button type="button" id="btn-scene-0" disabled>Демо (ТЗ)</button>
        <button type="button" id="btn-scene-1" disabled>Фигуры</button>
        <button type="button" id="btn-scene-2" disabled>Линии</button>
        <button type="button" id="btn-scene-auto" disabled>Автопереключение</button>
      </div>
    `;
  }
}

if (!customElements.get('control-panel')) {
  customElements.define('control-panel', ControlPanelElement);
}

export function setControlPanelReady(ready: boolean): void {
  const panel = document.querySelector(PANEL_SELECTOR);
  
  if (!panel) {
    return;
  }

  panel.classList.toggle('control-panel--ready', ready);
  panel.querySelectorAll('button').forEach((button) => {
    button.disabled = !ready;
  });
}
