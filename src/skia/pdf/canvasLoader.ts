import CanvasKitPdfInit, { type CanvasKit } from '@rollerbird/canvaskit-wasm-pdf';
import canvaskitPdfWasm from '@rollerbird/canvaskit-wasm-pdf/bin/canvaskit.wasm?url';

export class CanvasKitPdfLoader {
  private static canvasKitPdfPromise: Promise<CanvasKit> | null = null;

  load(): Promise<CanvasKit> {
    if (!CanvasKitPdfLoader.canvasKitPdfPromise) {
      CanvasKitPdfLoader.canvasKitPdfPromise = CanvasKitPdfInit({
        locateFile: () => canvaskitPdfWasm,
      }).then((ck) => {
        if (!ck.pdf) {
          throw new Error('CanvasKit WASM was built without PDF support (skia_enable_pdf)');
        }
        
        return ck;
      });
    }
    
    return CanvasKitPdfLoader.canvasKitPdfPromise;
  }
}