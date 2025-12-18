import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, FileText } from 'lucide-react';
import { UploadedFile } from '../types';

interface SortableFileRowProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

export const SortableFileRow: React.FC<SortableFileRowProps> = ({ file, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
    position: isDragging ? 'relative' as const : undefined,
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100 mb-3 group hover:shadow-md transition-all"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 mr-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
      >
        <GripVertical size={20} />
      </div>

      <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-4">
        <FileText className="text-red-500 w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 mr-4">
        <h4 className="font-medium text-slate-900 truncate" title={file.name}>
          {file.name}
        </h4>
        <div className="flex items-center text-xs text-slate-500 space-x-2">
          <span>{file.pageCount} page{file.pageCount !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{formatSize(file.size)}</span>
        </div>
      </div>

      <button
        onClick={() => onRemove(file.id)}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Remove file"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};