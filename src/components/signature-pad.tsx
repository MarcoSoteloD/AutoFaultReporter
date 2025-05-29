"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  width?: number;
  height?: number;
  onSignatureChange: (dataUrl: string | null) => void;
  backgroundColor?: string;
  penColor?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  width = 350,
  height = 150,
  onSignatureChange,
  backgroundColor = '#FFFFFF', // Use card background from theme
  penColor = 'hsl(var(--foreground))', // Use foreground color from theme
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  };

  useEffect(() => {
    const ctx = getCanvasContext();
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [width, height, backgroundColor, penColor]);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    if ('touches' in event) { // Touch event
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }
    // Mouse event
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const ctx = getCanvasContext();
    const coords = getCoordinates(event);
    if (ctx && coords) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
      setHasSigned(true);
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = getCanvasContext();
    const coords = getCoordinates(event);
    if (ctx && coords) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    const ctx = getCanvasContext();
    if (ctx) {
      ctx.closePath();
      setIsDrawing(false);
      if (canvasRef.current) {
        onSignatureChange(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  const clearPad = () => {
    const ctx = getCanvasContext();
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      onSignatureChange(null);
      setHasSigned(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing} // Stop drawing if mouse leaves canvas
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        className="border border-input rounded-md cursor-crosshair touch-none bg-card shadow-sm"
        style={{ backgroundColor }}
      />
      <div className="flex space-x-2">
        <Button type="button" variant="outline" onClick={clearPad} size="sm">
          <Eraser className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>
      {hasSigned && <p className="text-xs text-green-600 flex items-center"><Check size={14} className="mr-1"/> Signature captured.</p>}
    </div>
  );
};

export default SignaturePad;
