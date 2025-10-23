
import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageCompareProps {
  beforeSrc: string;
  afterSrc: string;
}

const ImageCompare: React.FC<ImageCompareProps> = ({ beforeSrc, afterSrc }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let newPosition = ((clientX - rect.left) / rect.width) * 100;
    if (newPosition < 0) newPosition = 0;
    if (newPosition > 100) newPosition = 100;
    setSliderPosition(newPosition);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    e.preventDefault();
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
  };

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  }, [handleMove]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging.current) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto select-none overflow-hidden rounded-lg shadow-xl aspect-auto group">
      <img src={beforeSrc} alt="Original" className="w-full h-auto block" draggable={false} />
      
      <div 
        className="absolute top-0 left-0 h-full w-full overflow-hidden" 
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={afterSrc} alt="Editada" className="w-full h-auto block absolute top-0 left-0" style={{width: containerRef.current?.clientWidth}} draggable={false} />
      </div>

      <div
        className="absolute top-0 h-full w-1.5 bg-white/70 cursor-ew-resize"
        style={{ left: `calc(${sliderPosition}% - 3px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full h-10 w-10 shadow-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
        </div>
      </div>
      
       <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Antes</div>
       <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded" style={{ opacity: sliderPosition > 80 ? 1 : 0, transition: 'opacity 0.3s' }}>Depois</div>
    </div>
  );
};

export default ImageCompare;
