import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Network, Languages, Brain } from "lucide-react";
import LabUtilityCard from "@/components/lab/LabUtilityCard";

const labTools = [
  {
    title: "Semantic Interference Map",
    description: "Bridges, Pitfalls & False Friends — Map the transfer patterns between L1 and L2 to predict and prevent learner errors.",
    icon: Languages,
    route: "/lab/interference",
    gradient: "from-indigo-600 to-blue-700",
  },
  {
    title: "Etymological Visualizer",
    description: "Word Roots & Language Connections — Trace vocabulary through history and across language families.",
    icon: Network,
    route: "/lab/etymology",
    gradient: "from-emerald-600 to-teal-700",
  },
  {
    title: "Cognitive Load Scanner",
    description: "Text Complexity & Fatigue Graph — Analyze reading difficulty and identify scaffolding opportunities.",
    icon: Brain,
    route: "/lab/cognitive",
    gradient: "from-amber-600 to-orange-700",
  },
];

const LabHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="academic-header">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Linguistic Lab</h1>
              <p className="text-sm opacity-90">AI-Powered Teaching Utilities</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b bg-card">
        <div className="container py-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <main className="container py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-5xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold font-serif text-foreground mb-4">
              Methodological Toolbox
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A diagnostic workstation for analyzing language transfer, etymology, 
              and cognitive complexity. Select a tool to begin your analysis.
            </p>
          </motion.div>

          {/* Utility Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {labTools.map((tool, index) => (
              <LabUtilityCard
                key={tool.route}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                route={tool.route}
                gradient={tool.gradient}
                index={index}
              />
            ))}
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 rounded-xl bg-muted/50 border text-center"
          >
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> All analyses use AI-powered linguistic models. 
              Results are designed to support pedagogical decisions and should be 
              cross-referenced with professional judgment.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default LabHome;
