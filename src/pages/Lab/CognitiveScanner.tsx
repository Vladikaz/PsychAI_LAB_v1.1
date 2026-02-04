import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import CognitiveLoadGraph from "@/components/lab/CognitiveLoadGraph";
import TextHeatmap from "@/components/lab/TextHeatmap";
import ScaffoldingPanel from "@/components/lab/ScaffoldingPanel";
import {
  getLabState,
  updateCognitiveScannerState,
  type CognitiveAnalysis,
} from "@/lib/labStore";
import { supabase } from "@/integrations/supabase/client";

const CognitiveScanner = () => {
  const navigate = useNavigate();
  const [textPassage, setTextPassage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CognitiveAnalysis | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const state = getLabState();
    setTextPassage(state.cognitiveScanner.textPassage);
    setResult(state.cognitiveScanner.analysisResult);
  }, []);

  // Persist state on change
  useEffect(() => {
    updateCognitiveScannerState({
      textPassage,
      analysisResult: result,
    });
  }, [textPassage, result]);

  const handleAnalyze = async () => {
    if (!textPassage.trim()) {
      toast.error("Please enter a text passage to analyze");
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-cognitive-load", {
        body: {
          textPassage: textPassage.trim(),
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Analysis failed. Please try again.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      // Validate and set result with safe defaults
      const analysis: CognitiveAnalysis = {
        loadPoints: Array.isArray(data?.loadPoints) ? data.loadPoints : [],
        overallScore: typeof data?.overallScore === "number" ? data.overallScore : 50,
        heatmapSegments: Array.isArray(data?.heatmapSegments) ? data.heatmapSegments : [],
        scaffoldingAdvice: Array.isArray(data?.scaffoldingAdvice) ? data.scaffoldingAdvice : [],
        graphData: Array.isArray(data?.graphData) ? data.graphData : [],
      };

      setResult(analysis);
      toast.success("Cognitive load analysis complete!");
    } catch (err) {
      console.error("Failed to analyze:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="academic-header">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Linguistic Lab</h1>
              <p className="text-sm opacity-90">Cognitive Load Scanner</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b bg-card">
        <div className="container py-3">
          <button
            onClick={() => navigate("/lab")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lab
          </button>
        </div>
      </div>

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Input Panel */}
          <div className="academic-card p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passage">Text Passage</Label>
                <Textarea
                  id="passage"
                  placeholder="Paste or type a text passage to analyze its cognitive complexity..."
                  value={textPassage}
                  onChange={(e) => setTextPassage(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="analysis-button"
              >
                {isAnalyzing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Scanning...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Cognitive Load
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Results */}
          {result ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Graph */}
              <div className="academic-card p-6">
                <CognitiveLoadGraph 
                  graphData={result.graphData ?? []} 
                  overallScore={result.overallScore ?? 50}
                />
              </div>

              {/* Heatmap & Scaffolding */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="academic-card p-6">
                  <TextHeatmap segments={result.heatmapSegments ?? []} />
                </div>

                <div className="academic-card p-6">
                  <ScaffoldingPanel advice={result.scaffoldingAdvice ?? []} />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="academic-card p-12 text-center">
              <div className="text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                <p className="text-sm max-w-md mx-auto">
                  Enter a text passage to analyze its cognitive load, identify 
                  complexity hotspots, and receive scaffolding recommendations.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default CognitiveScanner;
