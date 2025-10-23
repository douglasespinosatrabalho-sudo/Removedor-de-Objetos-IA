
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { editImageWithMask } from '../services/geminiService';
import ImageCompare from './ImageCompare';
import { LoadingSpinner } from './LoadingSpinner';
import { BackIcon, ClearIcon, DownloadIcon, UndoIcon } from './Icons';
import { fileToBase64, dataUrlToBlob } from '../utils/imageUtils';

interface ImageEditorProps {
  file: File;
  onReset: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ file, onReset }) => {
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(40);
  const [history, setHistory] = useState<ImageData[]>([]);

  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);

  const isDrawing = useRef(false);
  const originalImageUrl = useRef(URL.createObjectURL(file));

  const getCanvasContext = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
    return canvasRef.current?.getContext('2d', { willReadFrequently: true });
  }

  const drawImage = useCallback(() => {
    const image = new Image();
    image.src = originalImageUrl.current;
    image.onload = () => {
      const canvas = imageCanvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      if (!canvas || !drawingCanvas) return;

      const aspectRatio = image.width / image.height;
      const maxWidth = 800;
      let width = image.width > maxWidth ? maxWidth : image.width;
      let height = width / aspectRatio;
      
      const container = canvas.parentElement;
      if(container) {
          const containerWidth = container.clientWidth;
          width = image.width > containerWidth ? containerWidth : image.width;
          height = width / aspectRatio;
      }
      
      canvas.width = width;
      canvas.height = height;
      drawingCanvas.width = width;
      drawingCanvas.height = height;

      const ctx = getCanvasContext(imageCanvasRef);
      ctx?.drawImage(image, 0, 0, width, height);
      clearMask();
    };
  }, []);

  useEffect(() => {
    drawImage();
    window.addEventListener('resize', drawImage);
    return () => {
      URL.revokeObjectURL(originalImageUrl.current);
      window.removeEventListener('resize', drawImage);
    };
  }, [drawImage, file]);
  
  const saveToHistory = () => {
    const ctx = getCanvasContext(drawingCanvasRef);
    if(!ctx || !drawingCanvasRef.current) return;
    const imageData = ctx.getImageData(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    setHistory(prev => [...prev, imageData]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    const lastState = newHistory[newHistory.length - 1]; // Get previous state
    
    const ctx = getCanvasContext(drawingCanvasRef);
    if (ctx && drawingCanvasRef.current) {
      if (lastState) {
        ctx.putImageData(lastState, 0, 0);
      } else {
        ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
      }
    }
    setHistory(newHistory);
  };

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    saveToHistory();
    const { x, y } = getCoords(e);
    const ctx = getCanvasContext(drawingCanvasRef);
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    const ctx = getCanvasContext(drawingCanvasRef);
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = getCanvasContext(drawingCanvasRef);
    if(ctx) ctx.closePath();
    isDrawing.current = false;
  };

  const clearMask = () => {
    const canvas = drawingCanvasRef.current;
    const ctx = getCanvasContext(drawingCanvasRef);
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHistory([]);
  };

  const handleRemoveObject = async () => {
    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(p => (p < 95 ? p + 2 : p));
    }, 100);

    try {
      const maskCanvas = drawingCanvasRef.current;
      if (!maskCanvas) throw new Error("Canvas not found");
      
      const maskBlob = await dataUrlToBlob(maskCanvas.toDataURL('image/png'));
      const maskBase64 = await fileToBase64(maskBlob);

      const originalBase64 = await fileToBase64(file);
      
      const resultBase64 = await editImageWithMask(originalBase64, maskBase64);
      setEditedImageUrl(`data:image/png;base64,${resultBase64}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const hasDrawing = history.length > 0;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {!editedImageUrl && (
          <div className="relative w-full max-w-3xl mx-auto aspect-auto" style={{
              width: imageCanvasRef.current?.width,
              height: imageCanvasRef.current?.height
          }}>
              <canvas ref={imageCanvasRef} className="absolute top-0 left-0 rounded-lg shadow-lg" />
              <canvas
                  ref={drawingCanvasRef}
                  className="absolute top-0 left-0 cursor-crosshair opacity-70"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
              />
          </div>
      )}

      {isLoading && <LoadingSpinner progress={progress} />}
      
      {error && <div className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</div>}

      {editedImageUrl && !isLoading && (
        <ImageCompare beforeSrc={originalImageUrl.current} afterSrc={editedImageUrl} />
      )}

      {!isLoading && (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md w-full max-w-md flex flex-col gap-4">
          {!editedImageUrl && (
            <>
              <div className="flex flex-col gap-2">
                <label htmlFor="brushSize" className="text-sm font-medium text-gray-700">Tamanho do Pincel: {brushSize}px</label>
                <input
                  id="brushSize"
                  type="range"
                  min="5"
                  max="100"
                  value={brushSize}
                  onChange={e => setBrushSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={undo} disabled={!hasDrawing} className="control-btn disabled:opacity-50 disabled:cursor-not-allowed">
                  <UndoIcon /> Desfazer
                </button>
                <button onClick={clearMask} disabled={!hasDrawing} className="control-btn disabled:opacity-50 disabled:cursor-not-allowed">
                  <ClearIcon /> Limpar
                </button>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={onReset} className="control-btn"><BackIcon />Nova Imagem</button>
              {editedImageUrl ? (
                   <a
                     href={editedImageUrl}
                     download="imagem-editada.png"
                     className="action-btn download-btn"
                   >
                     <DownloadIcon /> Baixar Resultado
                   </a>
              ) : (
                  <button onClick={handleRemoveObject} disabled={!hasDrawing} className="action-btn disabled:opacity-50 disabled:cursor-not-allowed">
                      Remover Objeto
                  </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
