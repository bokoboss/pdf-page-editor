import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { PageItem } from '../types';

// Initialize PDF.js worker
// We use the CDN directly to avoid bundling issues with Vite/Rollup
const PDFJS_VERSION = '4.10.38'; 
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

/**
 * Cache for PDF.js document instances to avoid re-parsing large files 
 * for every thumbnail request.
 */
const pdfjsDocCache = new Map<string, pdfjsLib.PDFDocumentProxy>();

/**
 * Get or load a PDF.js document proxy
 */
const getPdfjsDoc = async (file: File, fileId: string): Promise<pdfjsLib.PDFDocumentProxy> => {
  const cached = pdfjsDocCache.get(fileId);
  if (cached) return cached;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ 
    data: arrayBuffer,
    disableAutoFetch: true,
    disableStream: false,
  });
  const pdf = await loadingTask.promise;
  pdfjsDocCache.set(fileId, pdf);
  return pdf;
};

export const clearPdfCache = () => {
  pdfjsDocCache.clear();
};

export const getPDFPageCount = async (file: File): Promise<number> => {
  const arrayBuffer = await file.arrayBuffer();
  // Using ignoreEncryption for better compatibility with some protected files
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return pdfDoc.getPageCount();
};

export const renderPageToDataURL = async (
  file: File, 
  pageIndex: number, 
  scale = 1.0, 
  rotation = 0,
  fileId?: string // Optional ID for caching
): Promise<string> => {
  // If we have a fileId, use the high-performance cache
  let pdf: pdfjsLib.PDFDocumentProxy;
  
  if (fileId) {
    pdf = await getPdfjsDoc(file, fileId);
  } else {
    const arrayBuffer = await file.arrayBuffer();
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  }
  
  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale, rotation: 0 }); // Render upright, rotate with CSS for perf
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) throw new Error('Canvas context not available');

  // For very large pages, we might need to cap the resolution to avoid browser canvas limits
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Cast to any to avoid type mismatch with pdfjs-dist RenderParameters
  await page.render({
    canvasContext: context,
    viewport: viewport,
  } as any).promise;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG for smaller thumbnail memory footprint
  
  // Clean up if not using cache
  if (!fileId) {
    pdf.destroy();
  }

  return dataUrl;
};

export const createMergedPDF = async (items: PageItem[], filesMap: Map<string, File>): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();
  const sourceDocs = new Map<string, PDFDocument>();
  
  // Optimization: Pre-load all required source documents
  // but we do it sequentially to avoid massive memory spikes
  for (const [id, file] of filesMap.entries()) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    sourceDocs.set(id, pdfDoc);
  }

  // Process pages
  for (const item of items) {
    const sourceDoc = sourceDocs.get(item.fileId);
    if (!sourceDoc) continue;

    const [copiedPage] = await mergedPdf.copyPages(sourceDoc, [item.originalPageIndex]);
    
    // Set rotation correctly
    if (item.rotation !== 0) {
      const currentRotation = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees(currentRotation + item.rotation));
    }

    mergedPdf.addPage(copiedPage);
  }

  return await mergedPdf.save();
};