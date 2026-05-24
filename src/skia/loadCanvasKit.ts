import CanvasKitInit, { type CanvasKit } from 'canvaskit-wasm';
import canvaskitWasm from 'canvaskit-wasm/bin/canvaskit.wasm?url';

let canvasKitPromise: Promise<CanvasKit> | null = null;

export function loadCanvasKit(): Promise<CanvasKit> {
  if (!canvasKitPromise) {
    canvasKitPromise = CanvasKitInit({
      locateFile: () => canvaskitWasm,
    });
  }
  
  return canvasKitPromise;
}
