import { ApiResponse, PromptRequest } from './types';

const mockResponses: CanvasData[] = [
  {
    type: 'shape',
    content: 'circle',
    position: { x: 100, y: 100 },
    dimensions: { width: 100, height: 100 },
    style: { fill: '#4f46e5' }
  },
  {
    type: 'text',
    content: 'Generated Content',
    position: { x: 150, y: 150 },
    style: { font: '24px Inter', fill: '#1f2937' }
  }
];

export async function simulateApiCall(request: PromptRequest): Promise<ApiResponse> {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  
  return {
    success: true,
    data: mockResponses
  };
}