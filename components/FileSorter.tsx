import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { UploadedFile } from '../types';
import { SortableFileRow } from './SortableFileRow';
import { Button } from './Button';
import { Plus, ArrowRight, ArrowLeft, Upload } from 'lucide-react';

interface FileSorterProps {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  onAddFiles: (files: FileList) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const FileSorter: React.FC<FileSorterProps> = ({
  files,
  setFiles,
  onAddFiles,
  onContinue,
  onBack
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRemove = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
      // Reset value to allow selecting the same file again if needed
      e.target.value = '';
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set to false if we are actually leaving the container, 
    // not just entering a child element.
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  return (
    <div 
      className="flex flex-col h-full max-w-3xl mx-auto w-full p-6 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-50/90 border-4 border-dashed border-blue-400 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 pointer-events-none">
           <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
             <Upload className="w-10 h-10 text-blue-600" />
           </div>
           <h3 className="text-xl font-bold text-blue-800">Drop files to add</h3>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Arrange Files</h2>
           <p className="text-slate-500 mt-1">Drag files to reorder them before merging.</p>
        </div>
        <div className="flex space-x-3">
             <Button variant="ghost" onClick={onBack} icon={<ArrowLeft size={18}/>}>
               Back
             </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-6">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={files.map(f => f.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {files.map(file => (
                <SortableFileRow 
                  key={file.id} 
                  file={file} 
                  onRemove={handleRemove} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        {files.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400">No files selected.</p>
            </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-200 bg-[#f8fafc]">
        <label className="cursor-pointer">
            <Button as="span" variant="secondary" icon={<Plus size={18}/>}>
              Add More Files
            </Button>
            <input 
              type="file" 
              className="hidden" 
              accept="application/pdf"
              multiple
              onChange={handleFileInputChange}
            />
        </label>
        
        <Button 
            onClick={onContinue} 
            disabled={files.length === 0}
            size="lg"
            icon={<ArrowRight size={18}/>}
            className="flex-row-reverse space-x-reverse"
        >
            Process Pages
        </Button>
      </div>
    </div>
  );
};