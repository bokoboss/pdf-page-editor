import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

interface LandingProps {
  onFilesSelected: (files: FileList) => void;
}

export const Landing: React.FC<LandingProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center max-w-2xl mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-6">
          <FileText className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
          Master Your PDFs
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Merge, split, reorder, and organize your PDF pages with ease. 
          <br className="hidden md:block"/>
          Secure, high-performance processing directly in your browser.
        </p>
      </div>

      <div className="w-full max-w-xl">
        <label 
          className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl cursor-pointer bg-white transition-all duration-300 group shadow-sm hover:shadow-md ${
            isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-slate-300 hover:bg-slate-50 hover:border-blue-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <div className={`p-4 rounded-full mb-4 transition-transform duration-300 ${isDragging ? 'bg-blue-100 scale-110' : 'bg-blue-50 group-hover:scale-110'}`}>
                <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-700' : 'text-blue-600'}`} />
            </div>
            <p className="mb-2 text-lg font-medium text-slate-700">
              {isDragging ? 'Drop files now' : 'Drop PDFs here or click to upload'}
            </p>
            <p className="text-sm text-slate-500">
              Optimized for large files and multi-page documents
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
          />
        </label>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl text-center">
        <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-2">Merge & Organize</h3>
          <p className="text-sm text-slate-500">Combine multiple documents and arrange pages in any order you need.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-2">Private & Secure</h3>
          <p className="text-sm text-slate-500">Files are processed locally. No data ever leaves your computer.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-2">High Performance</h3>
          <p className="text-sm text-slate-500">Efficient memory management allows handling of hundreds of pages.</p>
        </div>
      </div>
    </div>
  );
};