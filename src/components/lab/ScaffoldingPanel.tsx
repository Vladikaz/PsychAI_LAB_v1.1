import { motion } from "framer-motion";
import type { CognitiveAnalysis } from "@/lib/labStore";
import { Lightbulb, AlertCircle, Info, Target } from "lucide-react";

interface ScaffoldingPanelProps {
  advice: CognitiveAnalysis["scaffoldingAdvice"];
}

const ScaffoldingPanel = ({ advice }: ScaffoldingPanelProps) => {
  const safeAdvice = advice ?? [];

  const priorityConfig: Record<string, { icon: typeof AlertCircle; bg: string; iconColor: string }> = {
    high: {
      icon: AlertCircle,
      bg: "bg-destructive/10 border-l-destructive",
      iconColor: "text-destructive",
    },
    medium: {
      icon: Target,
      bg: "bg-warning/10 border-l-warning",
      iconColor: "text-warning",
    },
    low: {
      icon: Info,
      bg: "bg-muted border-l-muted-foreground",
      iconColor: "text-muted-foreground",
    },
  };

  if (safeAdvice.length === 0) {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Scaffolding Recommendations
        </h4>

        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No scaffolding recommendations generated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        Scaffolding Recommendations
      </h4>

      <div className="space-y-3">
        {safeAdvice.map((item, idx) => {
          const priority = item?.priority ?? 'medium';
          const config = priorityConfig[priority] ?? priorityConfig.medium;
          const Icon = config.icon;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${config.bg}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.iconColor}`} />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{item?.position ?? 'General'}</span>
                    <span className={`
                      px-2 py-0.5 rounded text-xs font-medium capitalize
                      ${priority === 'high' ? 'bg-destructive text-destructive-foreground' : ''}
                      ${priority === 'medium' ? 'bg-warning text-warning-foreground' : ''}
                      ${priority === 'low' ? 'bg-muted text-muted-foreground' : ''}
                    `}>
                      {priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{item?.advice ?? 'No advice available.'}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ScaffoldingPanel;
