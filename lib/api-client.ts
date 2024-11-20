import { ApiResponse } from "./types";


export async function generateChartData(prompt: string): Promise<ApiResponse> {
    try {
      const response = await fetch('http://localhost:5000/generate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate chart data',
      };
    }
  }
  