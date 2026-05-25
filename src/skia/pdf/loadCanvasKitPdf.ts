import CanvasKitPdfInit, { type CanvasKit } from '@rollerbird/canvaskit-wasm-pdf';
import canvaskitPdfWasm from '@rollerbird/canvaskit-wasm-pdf/bin/canvaskit.wasm?url';

let canvasKitPdfPromise: Promise<CanvasKit> | null = null;

export function loadCanvasKitPdf(): Promise<CanvasKit> {
  if (!canvasKitPdfPromise) {
    canvasKitPdfPromise = CanvasKitPdfInit({
      locateFile: () => canvaskitPdfWasm,
    }).then((ck) => {
      if (!ck.pdf) {
        throw new Error('CanvasKit WASM was built without PDF support (skia_enable_pdf)');
      }
      return ck;
    });
  }
  return canvasKitPdfPromise;
}
