import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ConnectionWeb from "@/components/lab/ConnectionWeb";
import {
  getLabState,
  updateEtymologyState,
  type EtymologyAnalysis,
} from "@/lib/labStore";
import { supabase } from "@/integrations/supabase/client";

const EtymologyVisualizer = () => {
  const navigate = useNavigate();
  const [words, setWords] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EtymologyAnalysis | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const state = getLabState();
    setWords(state.etymology.words);
    setResult(state.etymology.analysisResult);
  }, []);

  // Persist state on change
  useEffect(() => {
    updateEtymologyState({
      words,
      analysisResult: result,
    });
  }, [words, result]);

  const handleAnalyze = async () => {
    if (!words.trim()) {
      toast.error("Please enter words to analyze");
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-etymology", {
        body: {
          words: words.trim(),
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
      const analysis: EtymologyAnalysis = {
        connections: Array.isArray(data?.connections) ? data.connections : [],
        rootGroups: Array.isArray(data?.rootGroups) ? data.rootGroups : [],
      };

      setResult(analysis);
      toast.success("Etymology analysis complete!");
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
              <p className="text-sm opacity-90">Etymological Visualizer</p>
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
          {/* Control Panel */}
          <div className="academic-card p-6">
            <div className="grid md:grid-cols-[1fr,auto] gap-6 items-end">
              <div className="space-y-2">
                <Label htmlFor="words">Words to Analyze</Label>
                <Textarea
                  id="words"
                  placeholder="Enter words separated by commas or new lines...&#10;&#10;e.g., telephone, biology, photograph, democracy, manuscript"
                  value={words}
                  onChange={(e) => setWords(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="analysis-button h-12 px-8"
              >
                {isAnalyzing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Trace Origins
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
              className="academic-card p-6"
            >
              <ConnectionWeb 
                connections={result.connections ?? []} 
                rootGroups={result.rootGroups ?? []}
              />
            </motion.div>
          ) : (
            <div className="academic-card p-12 text-center">
              <div className="text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                <p className="text-sm max-w-md mx-auto">
                  Enter a list of vocabulary words to visualize their etymological 
                  connections, cognates across languages, and shared root families.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default EtymologyVisualizer;
