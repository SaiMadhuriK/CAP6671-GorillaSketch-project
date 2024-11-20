"use client";

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface JsonViewerProps {
  data: unknown;
  title?: string;
}

export function JsonViewer({ data, title }: JsonViewerProps) {
  return (
    <Card className="w-full max-w-sm bg-muted/50 backdrop-blur-sm">
      {title && (
        <div className="px-4 py-2 border-b border-border">
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
      )}
      <ScrollArea className="h-[300px]">
        <pre className="p-4 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </ScrollArea>
    </Card>
  );
}