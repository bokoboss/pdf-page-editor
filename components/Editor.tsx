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
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { PageItem, UploadedFile } from '../types';
import { SortablePage } from './SortablePage';
import { Button } from './Button';
import { Plus, Download, ArrowLeft, RotateCw, Trash2, Upload } from 'lucide-react';

interface EditorProps {
  filesMap: Map<string, File>;
  items: PageItem[];
  setItems: React.Dispatch<React.SetStateAction<PageItem[]>>;
  onAddFiles: (files: FileList) => void;
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export const Editor: React.FC<EditorProps> = ({
  filesMap,
  items,
  setItems,
  onAddFiles,
  onSave,
  onBack,
  isSaving
}) => {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // Prevent accidental drags when clicking
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRotate = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item
    ));
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
    });
  };

  const toggleSelection = (id: string) => {
      setSelectedIds(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
      });
  };

  const handleBulkRotate = () => {
    setItems(prev => prev.map(item => 
      selectedIds.has(item.id) ? { ...item, rotation: (item.rotation + 90) % 360 } : item
    ));
  };

  const handleBulkDelete = () => {
    setItems(prev => prev.filter(item => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
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
      className="flex flex-col h-screen bg-slate-50/50 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
       {/* Drag Overlay */}
       {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-50/90 border-4 border-dashed border-blue-400 m-4 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm pointer-events-none animate-in fade-in duration-200">
           <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
             <Upload className="w-10 h-10 text-blue-600" />
           </div>
           <h3 className="text-xl font-bold text-blue-800">Drop files to add pages</h3>
        </div>
      )}

      {/* Top Toolbar */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft size={18} />}>
            Back
          </Button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <h2 className="text-lg font-semibold text-slate-800">
            {items.length} Page{items.length !== 1 ? 's' : ''}
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center space-x-2 mr-4 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
               <span className="text-sm text-blue-800 font-medium mr-2">{selectedIds.size} Selected</span>
               <Button variant="ghost" size="sm" onClick={handleBulkRotate} title="Rotate Selected">
                 <RotateCw size={16} className="text-blue-700"/>
               </Button>
               <Button variant="ghost" size="sm" onClick={handleBulkDelete} title="Delete Selected">
                 <Trash2 size={16} className="text-red-600"/>
               </Button>
            </div>
          )}

          <label className="cursor-pointer">
            <Button as="span" variant="secondary" icon={<Plus size={18}/>}>
              Add Files
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
            variant="primary" 
            onClick={onSave} 
            isLoading={isSaving}
            icon={<Download size={18}/>}
          >
            Export PDF
          </Button>
        </div>
      </header>

      {/* Main Grid Canvas */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items.map(i => i.id)} 
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {items.map((item, index) => {
                    const file = filesMap.get(item.fileId);
                    if (!file) return null;
                    return (
                        <SortablePage 
                          key={item.id} 
                          item={item} 
                          file={file}
                          pageNumberDisplay={index + 1}
                          onRotate={handleRotate}
                          onDelete={handleDelete}
                          selected={selectedIds.has(item.id)}
                          onSelect={toggleSelection}
                        />
                    );
                })}
              </div>
            </SortableContext>
          </DndContext>
          
          {items.length === 0 && (
             <div className="text-center py-20">
                <p className="text-slate-400">No pages remaining. Add more files to continue.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};