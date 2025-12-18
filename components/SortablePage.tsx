import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PDFThumbnail } from './PDFThumbnail';
import { PageItem } from '../types';
import { Trash2, RotateCw } from 'lucide-react';

interface SortablePageProps {
  item: PageItem;
  file: File;
  pageNumberDisplay: number;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export const SortablePage: React.FC<SortablePageProps> = ({
  item,
  file,
  pageNumberDisplay,
  onRotate,
  onDelete,
  selected,
  onSelect
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
        selected ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-slate-100'
      }`}
      onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          onSelect && onSelect(item.id);
      }}
    >
      <div 
        className="relative w-full shadow-md rounded-lg overflow-hidden bg-white cursor-grab active:cursor-grabbing"
        {...attributes} 
        {...listeners}
      >
        <PDFThumbnail 
          file={file} 
          pageIndex={item.originalPageIndex} 
          rotation={item.rotation}
          fileId={item.fileId}
          className="w-full pointer-events-none select-none"
        />
        
        {/* Overlay Controls */}
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg p-1 backdrop-blur-sm">
          <button 
            onClick={(e) => { e.stopPropagation(); onRotate(item.id); }}
            className="p-1.5 text-white hover:bg-white/20 rounded-md transition-colors"
            title="Rotate"
          >
            <RotateCw size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            className="p-1.5 text-white hover:bg-red-500/80 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Page Number Badge */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium rounded-full">
          {pageNumberDisplay}
        </div>
      </div>
    </div>
  );
};