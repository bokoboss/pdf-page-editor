import React, { useEffect, useState, useRef } from 'react';
import { renderPageToDataURL } from '../services/pdfService';

interface PDFThumbnailProps {
  file: File;
  pageIndex: number;
  rotation: number;
  className?: string;
  fileId?: string; // Add fileId for caching
}

export const PDFThumbnail: React.FC<PDFThumbnailProps> = ({ file, pageIndex, rotation, className, fileId }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const loadThumbnail = async () => {
      setLoading(true);
      setError(false);
      try {
        // Pass fileId to use the optimized document cache
        const url = await renderPageToDataURL(file, pageIndex, 0.4, 0, fileId); 
        if (isMounted.current) {
          setImageSrc(url);
        }
      } catch (err) {
        console.error("Failed to render thumbnail", err);
        if (isMounted.current) setError(true);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    loadThumbnail();

    return () => {
      isMounted.current = false;
    };
  }, [file, pageIndex, fileId]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 rounded-lg ${className}`} style={{ aspectRatio: '210/297' }}>
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 text-xs rounded-lg ${className}`} style={{ aspectRatio: '210/297' }}>
        <span>Error</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-sm bg-white ${className}`}>
        <img 
          src={imageSrc} 
          alt={`Page ${pageIndex + 1}`} 
          className="w-full h-full object-contain transition-transform duration-300"
          style={{ transform: `rotate(${rotation}deg)` }} 
          loading="lazy"
        />
    </div>
  );
};