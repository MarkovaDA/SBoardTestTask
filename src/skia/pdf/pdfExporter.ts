import type { CanvasKit, PDFMetadata } from '@rollerbird/canvaskit-wasm-pdf';
import type { Container } from 'pixi.js-legacy';

import type { SkiaCanvasApi, SkiaCanvasKitApi, SkiaRendererOptions } from '../../types';

import { PendingStrokeCommitter } from '../pixi/strokeCommitter';
import { PixiSceneDrawer } from '../pixi/sceneDrawer';

import { CanvasKitPdfLoader } from './canvasLoader';
import {
  PDF_METADATA_AUTHOR,
  PDF_METADATA_CREATOR,
  PDF_METADATA_PRODUCER,
  PDF_METADATA_TITLE,
  PDF_RASTER_DPI,
} from './constants';

export class SkiaPdfExporter {
  private readonly strokeCommitter = new PendingStrokeCommitter();

  private constructor(
    private readonly canvasKit: CanvasKit,
    private readonly options: SkiaRendererOptions,
  ) {}

  static async create(options: SkiaRendererOptions): Promise<SkiaPdfExporter> {
    const canvasKit = await new CanvasKitPdfLoader().load();
    return new SkiaPdfExporter(canvasKit, options);
  }

  export(container: Container): Uint8Array {
    this.strokeCommitter.commit(container);

    const { width, height } = this.options;

    const metadata = {
      title: PDF_METADATA_TITLE,
      author: PDF_METADATA_AUTHOR,
      creator: PDF_METADATA_CREATOR,
      producer: PDF_METADATA_PRODUCER,
      rasterDPI: PDF_RASTER_DPI,
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

  exportFromCanvas(sourceCanvas: HTMLCanvasElement): Uint8Array {
    const { width, height } = this.options;

    const metadata = {
      title: PDF_METADATA_TITLE,
      author: PDF_METADATA_AUTHOR,
      creator: PDF_METADATA_CREATOR,
      producer: PDF_METADATA_PRODUCER,
      rasterDPI: PDF_RASTER_DPI,
      compressionLevel: this.canvasKit.PDFCompressionLevel.Default,
      _rootTag: null,
    } as PDFMetadata & { _rootTag: null };

    const doc = this.canvasKit.MakePDFDocument(metadata);
    const pageCanvas = doc.beginPage(width, height);

    const image = this.canvasKit.MakeImageFromCanvasImageSource(sourceCanvas);

    if (image) {
      const paint = new this.canvasKit.Paint();
      const src: [number, number, number, number] = [0, 0, sourceCanvas.width, sourceCanvas.height];
      const dest: [number, number, number, number] = [0, 0, width, height];
      pageCanvas.drawImageRect(image, src, dest, paint, false);
      paint.delete();
      image.delete();
    }

    doc.endPage();
    const pdfBytes = doc.close();
    doc.delete();

    return pdfBytes;
  }
}

