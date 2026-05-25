import type { CanvasKit, PDFMetadata } from '@rollerbird/canvaskit-wasm-pdf';
import type { Container } from 'pixi.js';
import type { SkiaCanvasApi, SkiaCanvasKitApi } from '../types';
import { commitPendingStrokes } from '../pixi/commitPendingStrokes';
import { PixiSceneDrawer } from '../pixi/pixiSceneDrawer';
import type { SkiaRendererOptions } from '../types';
import { loadCanvasKitPdf } from './loadCanvasKitPdf';

export class SkiaPdfExporter {
  private constructor(
    private readonly canvasKit: CanvasKit,
    private readonly options: SkiaRendererOptions,
  ) {}

  static async create(options: SkiaRendererOptions): Promise<SkiaPdfExporter> {
    const canvasKit = await loadCanvasKitPdf();
    return new SkiaPdfExporter(canvasKit, options);
  }

  export(container: Container): Uint8Array {
    commitPendingStrokes(container);

    const { width, height } = this.options;

    const metadata = {
      title: 'SBoard Export',
      author: 'SBoard Test Task',
      creator: 'SBoard Test Task',
      producer: 'Skia PDF',
      rasterDPI: 72,
      compressionLevel: this.canvasKit.PDFCompressionLevel.Default,
      _rootTag: null,
    } as PDFMetadata & { _rootTag: null };

    const doc = this.canvasKit.MakePDFDocument(metadata);

    const pageCanvas = doc.beginPage(width, height);

    const drawer = new PixiSceneDrawer(
      this.canvasKit as unknown as SkiaCanvasKitApi,
      this.options,
    );

    drawer.draw(container, pageCanvas as unknown as SkiaCanvasApi);
    doc.endPage();

    const pdfBytes = doc.close();
    doc.delete();

    return pdfBytes;
  }
}
