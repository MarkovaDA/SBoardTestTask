import type { Container } from 'pixi.js-legacy';

import type { SkiaPdfExporter } from '../skia/pdf';
import type { SkiaRendererOptions } from '../types';
import {
  PDF_EXPORT_BUTTON_LABEL,
  PDF_EXPORT_ERROR_MESSAGE,
  PDF_EXPORT_FILENAME,
  PDF_EXPORT_LOADING_LABEL,
} from './constants';

/** Vector PDF export for the current Pixi stage. */
export class PdfExport {
  private pdfExporter: SkiaPdfExporter | null = null;

  constructor(
    private readonly exportBtn: HTMLButtonElement,
    private readonly getRenderOptions: () => SkiaRendererOptions,
    private readonly getStage: () => Container,
    private readonly renderStage: () => void,
  ) {}

  invalidate(): void {
    this.pdfExporter = null;
  }

  async exportPdf(): Promise<void> {
    const previousLabel = this.exportBtn.textContent;
    this.exportBtn.disabled = true;
    this.exportBtn.textContent = PDF_EXPORT_LOADING_LABEL;

    try {
      const pdf = await import('../skia/pdf');
      const renderOptions = this.getRenderOptions();

      if (!this.pdfExporter) {
        this.pdfExporter = await pdf.SkiaPdfExporter.create({
          width: renderOptions.width,
          height: renderOptions.height,
          background: renderOptions.background,
        });
      }

      this.renderStage();
      const bytes = this.pdfExporter.export(this.getStage());

      new pdf.PdfDownloader().download(bytes, PDF_EXPORT_FILENAME);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert(PDF_EXPORT_ERROR_MESSAGE);
    } finally {
      this.exportBtn.disabled = false;
      this.exportBtn.textContent = previousLabel ?? PDF_EXPORT_BUTTON_LABEL;
    }
  }
}
