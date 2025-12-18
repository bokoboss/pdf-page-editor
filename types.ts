export interface UploadedFile {
  id: string;
  name: string;
  file: File;
  pageCount: number;
  size: number;
}

export interface PageItem {
  id: string; // Unique ID for the sortable item
  fileId: string; // Reference to the source file
  originalPageIndex: number; // 0-based index in the source file
  rotation: number; // Rotation in degrees (0, 90, 180, 270)
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';