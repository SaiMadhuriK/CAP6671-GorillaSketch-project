"use client";

import { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CanvasData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CanvasDisplayProps {
  data?: CanvasData[];
  isLoading: boolean;
  className?: string;
}

export function CanvasDisplay({ data, isLoading, className }: CanvasDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render each item
    data.forEach(item => {
      switch (item.type) {
        case 'shape':
          if (item.content === 'circle') {
            ctx.beginPath();
            ctx.arc(
              item.position.x,
              item.position.y,
              (item.dimensions?.width || 50) / 2,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = item.style?.fill || '#000';
            ctx.fill();
          }
          break;
        case 'text':
          ctx.font = item.style?.font || '16px Inter';
          ctx.fillStyle = item.style?.fill || '#000';
          ctx.fillText(item.content, item.position.x, item.position.y);
          break;
      }
    });
  }, [data]);

  return (
    <Card className={cn(
      "w-full aspect-video bg-card/50 backdrop-blur-sm border-2 relative overflow-hidden",
      isLoading ? "border-primary" : "border-muted",
      className
    )}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={800}
        height={600}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Processing prompt...</p>
          </div>
        </div>
      )}
    </Card>
  );
}