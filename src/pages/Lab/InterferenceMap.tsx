import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import BridgeSchema from "@/components/lab/BridgeSchema";
import PitfallRadar from "@/components/lab/PitfallRadar";
import FalseFriendsList from "@/components/lab/FalseFriendsList";
import DecisionTree from "@/components/lab/DecisionTree";
import {
  getLabState,
  updateInterferenceMapState,
  type InterferenceAnalysis,
} from "@/lib/labStore";
import { supabase } from "@/integrations/supabase/client";

const InterferenceMap = () => {
  const navigate = useNavigate();
  const [l1Text, setL1Text] = useState("");
  const [l2Text, setL2Text] = useState("");
  const [taskCategory, setTaskCategory] = useState("grammar");
  const [contentArea, setContentArea] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<InterferenceAnalysis | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const state = getLabState();
    setL1Text(state.interferenceMap.l1Text);
    setL2Text(state.interferenceMap.l2Text);
    setTaskCategory(state.interferenceMap.taskCategory);
    setContentArea(state.interferenceMap.contentArea);
    setResult(state.interferenceMap.analysisResult);
  }, []);

  // Persist state on change
  useEffect(() => {
    updateInterferenceMapState({
      l1Text,
      l2Text,
      taskCategory,
      contentArea,
      analysisResult: result,
    });
  }, [l1Text, l2Text, taskCategory, contentArea, result]);

  const handleAnalyze = async () => {
    if (!l1Text.trim() || !l2Text.trim()) {
      toast.error("Please enter both L1 and L2 languages");
      return;
    }
    if (!contentArea.trim()) {
      toast.error("Please enter content to analyze");
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-interference", {
        body: {
          l1: l1Text.trim(),
          l2: l2Text.trim(),
          taskCategory,
          contentArea: contentArea.trim(),
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
      const analysis: InterferenceAnalysis = {
        bridges: Array.isArray(data?.bridges) ? data.bridges : [],
        pitfalls: Array.isArray(data?.pitfalls) ? data.pitfalls : [],
        falseFriends: Array.isArray(data?.falseFriends) ? data.falseFriends : [],
        decisionTree: Array.isArray(data?.decisionTree) ? data.decisionTree : [],
      };

      setResult(analysis);
      toast.success("Analysis complete!");
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
              <p className="text-sm opacity-90">Semantic Interference Map</p>
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
          className="grid lg:grid-cols-[400px,1fr] gap-8"
        >
          {/* Control Panel */}
          <div className="space-y-6">
            <div className="academic-card p-6 space-y-6">
              <h3 className="font-semibold text-lg">Input Parameters</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="l1">L1 (Native Language)</Label>
                    <Input
                      id="l1"
                      placeholder="e.g., Russian"
                      value={l1Text}
                      onChange={(e) => setL1Text(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="l2">L2 (Target Language)</Label>
                    <Input
                      id="l2"
                      placeholder="e.g., English"
                      value={l2Text}
                      onChange={(e) => setL2Text(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Task Category</Label>
                  <Select value={taskCategory} onValueChange={setTaskCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grammar">Grammar</SelectItem>
                      <SelectItem value="vocabulary">Vocabulary</SelectItem>
                      <SelectItem value="phonetics">Phonetics</SelectItem>
                      <SelectItem value="pragmatics">Pragmatics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content Area</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter grammar rules, vocabulary lists, or linguistic patterns to analyze..."
                    value={contentArea}
                    onChange={(e) => setContentArea(e.target.value)}
                    rows={6}
                  />
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full analysis-button"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Info Panel */}
            <div className="academic-card p-4 text-sm text-muted-foreground">
              <p>
                <strong>Tip:</strong> Enter a specific grammar rule or vocabulary set.
                The AI will map transfer patterns between L1 and L2.
              </p>
            </div>
          </div>

          {/* Analysis Workspace */}
          <div className="space-y-6">
            {result ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="academic-card p-6"
              >
                <Tabs defaultValue="bridges" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="bridges">Bridges</TabsTrigger>
                    <TabsTrigger value="pitfalls">Pitfalls</TabsTrigger>
                    <TabsTrigger value="falsefriends">False Friends</TabsTrigger>
                    <TabsTrigger value="tree">Decision Tree</TabsTrigger>
                  </TabsList>

                  <TabsContent value="bridges">
                    <BridgeSchema bridges={result.bridges ?? []} />
                  </TabsContent>

                  <TabsContent value="pitfalls">
                    <PitfallRadar pitfalls={result.pitfalls ?? []} />
                  </TabsContent>

                  <TabsContent value="falsefriends">
                    <FalseFriendsList falseFriends={result.falseFriends ?? []} />
                  </TabsContent>

                  <TabsContent value="tree">
                    <DecisionTree steps={result.decisionTree ?? []} />
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : (
              <div className="academic-card p-12 text-center">
                <div className="text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                  <p className="text-sm">
                    Fill in the parameters and click "Generate Analysis" to see
                    the semantic interference map.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default InterferenceMap;
