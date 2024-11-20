export interface CanvasData {
  type: 'shape' | 'text' | 'image';
  content: string;
  position: { x: number; y: number };
  dimensions?: { width: number; height: number };
  style?: Record<string, string>;
}

export interface ChartSeries {
  name: string;
  data: number[];
}

export interface ChartData {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'radar';
  series: ChartSeries[];
  labels?: string[];
  title: string;
  xaxisTitle?: string;
  yaxisTitle?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface PromptRequest {
  prompt: string;
  timestamp: number;
}