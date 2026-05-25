/** ~50% viewport width per panel; height ~50% of the window. */
export function getViewportCanvasSize(): { width: number; height: number } {
  const bodyPadding = 48;
  const panelGap = 24;
  const width = Math.floor((window.innerWidth - bodyPadding - panelGap) / 2);
  const height = Math.floor(window.innerHeight * 0.5);

  return {
    width: Math.max(320, width),
    height: Math.max(240, height),
  };
}
