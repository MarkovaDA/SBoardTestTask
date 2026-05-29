const PANEL_SELECTOR = '.control-panel';

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
