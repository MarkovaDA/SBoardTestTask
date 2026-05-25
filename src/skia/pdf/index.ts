/**
 * Модуль векторного экспорта в PDF через Skia PDF backend.
 * Использует отдельную WASM-сборку CanvasKit (`@rollerbird/canvaskit-wasm-pdf`).
 */
export { loadCanvasKitPdf } from './loadCanvasKitPdf';
export { SkiaPdfExporter } from './skiaPdfExporter';
export { downloadPdf } from './download';
