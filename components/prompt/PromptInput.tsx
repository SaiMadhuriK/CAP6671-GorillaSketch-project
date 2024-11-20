"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
  placeholder: string;
}

export function PromptInput({ onSubmit, isLoading, placeholder }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onSubmit(prompt);
    setPrompt('');
  };

  return (
    <div className="fixed bottom-0 w-full bg-background/80 backdrop-blur-md border-t border-border p-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className="flex-grow"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !prompt.trim()}
          className="w-24"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}