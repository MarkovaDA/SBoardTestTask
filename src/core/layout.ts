import {
  CANVAS_BODY_PADDING,
  CANVAS_MIN_HEIGHT,
  CANVAS_MIN_WIDTH,
  CANVAS_PANEL_GAP,
  CANVAS_VIEWPORT_HEIGHT_RATIO,
} from './constants';

/** ~50% viewport width per panel; height ~50% of the window. */
export class CanvasLayout {
  getViewportCanvasSize(): { width: number; height: number } {
    const width = Math.floor((window.innerWidth - CANVAS_BODY_PADDING - CANVAS_PANEL_GAP) / 2);
    const height = Math.floor(window.innerHeight * CANVAS_VIEWPORT_HEIGHT_RATIO);

    return {
      width: Math.max(CANVAS_MIN_WIDTH, width),
      height: Math.max(CANVAS_MIN_HEIGHT, height),
    };
  }
}
