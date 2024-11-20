// components/chart/ChartDisplay.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ApexOptions } from 'apexcharts';

// Import ApexCharts dynamically to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface ChartData {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'radar';
  series: Array<{
    name: string;
    data: number[];
  }>;
  labels?: string[];
  title: string;
  xaxisTitle?: string;
  yaxisTitle?: string;
}

interface ChartDisplayProps {
  data?: ChartData;
  isLoading: boolean;
}

export const ChartDisplay: React.FC<ChartDisplayProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-[400px]">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-muted-foreground">
            Enter a prompt to generate a chart
          </div>
        </CardContent>
      </Card>
    );
  }

  const getChartOptions = (data: ChartData): ApexOptions => {
    const baseOptions: ApexOptions = {
      chart: {
        type: data.chartType,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
          }
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      title: {
        text: data.title,
        align: 'center',
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1f2937'
        }
      },
      theme: {
        mode: 'light',
        palette: 'palette1',
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      grid: {
        borderColor: '#e2e8f0',
        row: {
          colors: ['transparent', 'transparent'],
          opacity: 0.5
        }
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        y: {
          formatter: (value: number) => value.toLocaleString()
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        offsetY: 8
      }
    };

    // Add specific options based on chart type
    if (data.chartType === 'pie') {
      return {
        ...baseOptions,
        labels: data.labels,
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 320
            },
            legend: {
              position: 'bottom'
            }
          }
        }],
        plotOptions: {
          pie: {
            donut: {
              size: '65%'
            }
          }
        }
      };
    }

    return {
      ...baseOptions,
      xaxis: {
        categories: data.labels,
        title: {
          text: data.xaxisTitle,
          style: {
            fontSize: '14px',
            color: '#64748b'
          }
        },
        labels: {
          style: {
            colors: '#64748b'
          }
        }
      },
      yaxis: {
        title: {
          text: data.yaxisTitle,
          style: {
            fontSize: '14px',
            color: '#64748b'
          }
        },
        labels: {
          style: {
            colors: '#64748b'
          },
          formatter: (value: number) => value.toLocaleString()
        }
      }
    };
  };

  const chartOptions = getChartOptions(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <Chart
            options={chartOptions}
            series={data.chartType === 'pie' ? data.series[0].data : data.series}
            type={data.chartType}
            height="100%"
            width="100%"
          />
        </div>
      </CardContent>
    </Card>
  );
};