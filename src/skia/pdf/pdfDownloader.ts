import { DEFAULT_PDF_FILENAME, PDF_MIME_TYPE } from './constants';

export class PdfDownloader {
  download(bytes: Uint8Array, filename = DEFAULT_PDF_FILENAME): void {
    const blob = new Blob([Uint8Array.from(bytes)], { type: PDF_MIME_TYPE });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
