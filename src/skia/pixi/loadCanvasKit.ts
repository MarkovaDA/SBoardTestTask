import CanvasKitInit, { type CanvasKit } from 'canvaskit-wasm';
import canvaskitWasm from 'canvaskit-wasm/bin/canvaskit.wasm?url';

/** CanvasKit for Skia preview canvas (lighter build, no PDF). */
export class CanvasKitLoader {
  private static canvasKitPromise: Promise<CanvasKit> | null = null;

  load(): Promise<CanvasKit> {
    if (!CanvasKitLoader.canvasKitPromise) {
      CanvasKitLoader.canvasKitPromise = CanvasKitInit({
        locateFile: () => canvaskitWasm,
      });
    }
    return CanvasKitLoader.canvasKitPromise;
  }
}
