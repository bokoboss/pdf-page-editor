import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Landing } from './components/Landing';
import { FileSorter } from './components/FileSorter';
import { Editor } from './components/Editor';
import { Modal } from './components/Modal';
import { UploadedFile, PageItem } from './types';
import { getPDFPageCount, createMergedPDF, clearPdfCache } from './services/pdfService';
import { FileText } from 'lucide-react';

const App: React.FC = () => {
  // Application State
  const [view, setView] = useState<'landing' | 'file-order' | 'editor'>('landing');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('Processing...');
  const [showExitModal, setShowExitModal] = useState(false);

  // Data State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [filesMap, setFilesMap] = useState<Map<string, File>>(new Map());
  const [pageItems, setPageItems] = useState<PageItem[]>([]);

  // 1. Handle file upload
  const handleFilesAdded = useCallback(async (newFiles: FileList) => {
    setIsProcessing(true);
    setProcessingMsg('Analyzing PDFs...');
    const newUploadedFiles: UploadedFile[] = [];

    try {
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        if (file.type !== 'application/pdf') continue;

        try {
            const pageCount = await getPDFPageCount(file);
            newUploadedFiles.push({
              id: uuidv4(),
              name: file.name,
              file: file,
              size: file.size,
              pageCount: pageCount
            });
        } catch (err) {
            console.error(`Failed to process file ${file.name}`, err);
        }
      }

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      if (view === 'landing' && newUploadedFiles.length > 0) {
        setView('file-order');
      }
    } catch (error) {
      console.error("Error processing files:", error);
      alert("An error occurred while loading files. They might be corrupted or too large for your browser's memory.");
    } finally {
      setIsProcessing(false);
    }
  }, [view]);

  // 2. Transition from FileSorter to Editor
  const handleContinueToEditor = async () => {
    setIsProcessing(true);
    setProcessingMsg('Preparing pages...');
    const newFilesMap = new Map<string, File>();
    const newPageItems: PageItem[] = [];

    try {
      for (const fileItem of uploadedFiles) {
        newFilesMap.set(fileItem.id, fileItem.file);
        for (let j = 0; j < fileItem.pageCount; j++) {
          newPageItems.push({
            id: uuidv4(),
            fileId: fileItem.id,
            originalPageIndex: j,
            rotation: 0
          });
        }
      }

      setFilesMap(newFilesMap);
      setPageItems(newPageItems);
      setView('editor');
    } catch (error) {
      console.error("Error preparing editor:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Final Save/Export
  const handleSave = async () => {
    if (pageItems.length === 0) return;
    setIsProcessing(true);
    setProcessingMsg('Generating final PDF. This may take a moment for large documents...');
    try {
      const pdfBytes = await createMergedPDF(pageItems, filesMap);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pdf-master-merged-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("Failed to generate PDF. The resulting file might be too large for your browser to handle in one go.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigation Handlers
  const handleBackToFileSorter = () => {
    setShowExitModal(true);
  };

  const confirmBackToFileSorter = () => {
    clearPdfCache(); // Clear memory when leaving editor
    setPageItems([]);
    setFilesMap(new Map());
    setView('file-order');
    setShowExitModal(false);
  };

  const handleBackToLanding = () => {
      clearPdfCache();
      setUploadedFiles([]);
      setView('landing');
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-[#f8fafc] flex flex-col">
      <nav className="flex-none flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 z-20">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => { if(view !== 'landing') setShowExitModal(true); }}>
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <FileText className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">PDF Master</span>
            </div>
      </nav>

      <div className="flex-1 flex flex-col relative">
        {view === 'landing' && <Landing onFilesSelected={handleFilesAdded} />}

        {view === 'file-order' && (
            <FileSorter 
                files={uploadedFiles}
                setFiles={setUploadedFiles}
                onAddFiles={handleFilesAdded}
                onContinue={handleContinueToEditor}
                onBack={handleBackToLanding}
            />
        )}

        {view === 'editor' && (
            <Editor 
                filesMap={filesMap}
                items={pageItems}
                setItems={setPageItems}
                onAddFiles={handleFilesAdded}
                onSave={handleSave}
                onBack={handleBackToFileSorter}
                isSaving={isProcessing}
            />
        )}
      </div>

      <Modal 
        isOpen={showExitModal}
        title={view === 'editor' ? "Back to File List?" : "Start Over?"}
        message={view === 'editor' 
            ? "Going back will reset your page arrangements. You will return to the file list." 
            : "Are you sure you want to go back to home? All selected files will be cleared."}
        onConfirm={view === 'editor' ? confirmBackToFileSorter : () => { handleBackToLanding(); setShowExitModal(false); }}
        onCancel={() => setShowExitModal(false)}
      />

      {isProcessing && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
           <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
           <p className="text-slate-600 font-medium max-w-sm">{processingMsg}</p>
           <p className="text-xs text-slate-400 mt-2">Please keep this window open</p>
        </div>
      )}
    </div>
  );
};

export default App;