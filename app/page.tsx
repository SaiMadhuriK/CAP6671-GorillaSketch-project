// pages/index.tsx
"use client";

import { useState } from "react";
import { CanvasDisplay } from "@/components/canvas/CanvasDisplay";
import { ChartDisplay } from "@/components/chart/ChartDisplay";
import { PromptInput } from "@/components/prompt/PromptInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast"; 
import type { CanvasData, ChartData } from "@/lib/types";
import { generateChartData } from "@/lib/api-client";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"canvas" | "chart">("chart");
  const [isLoading, setIsLoading] = useState(false);
  const [canvasData, setCanvasData] = useState<CanvasData[]>([]);
  const [chartData, setChartData] = useState<ChartData | undefined>();

  const handlePromptSubmit = async (prompt: string) => {
    try {
      setIsLoading(true);

      if (activeTab === "chart") {
        const result = await generateChartData(prompt);
        if (result.success && result.data) {
          setChartData(result.data);
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to generate chart",
            variant: "destructive",
          });
        }
      } else {
        // Handle canvas generation
        const response = await fetch("http://localhost:5000/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        const result = await response.json();
        if (result.success) {
          setCanvasData(result.data);
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Failed to process prompt:", error);
      toast({
        title: "Error",
        description: "Failed to process prompt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={(value: "canvas" | "chart") => setActiveTab(value)}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="canvas" className="mt-0">
            <CanvasDisplay
              data={canvasData}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="chart" className="mt-0">
            <ChartDisplay
              data={chartData}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        <PromptInput
          onSubmit={handlePromptSubmit}
          isLoading={isLoading}
          placeholder={
            activeTab === "chart"
              ? "Describe the chart you want to create..."
              : "Describe what to draw..."
          }
        />
      </div>
    </main>
  );
}