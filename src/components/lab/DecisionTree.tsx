import { motion } from "framer-motion";
import type { InterferenceAnalysis } from "@/lib/labStore";
import { GitBranch, CheckCircle, XCircle, ArrowDown } from "lucide-react";

interface DecisionTreeProps {
  steps: InterferenceAnalysis["decisionTree"];
}

const DecisionTree = ({ steps }: DecisionTreeProps) => {
  const safeSteps = steps ?? [];

  if (safeSteps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>No decision tree steps generated for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-primary" />
        Decision Tree — L1 Logic → L2 Output
      </h4>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />

        <div className="space-y-4">
          {safeSteps.map((step, idx) => {
            const isError = step?.isError ?? false;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="relative flex items-start gap-4"
              >
                {/* Step Number */}
                <div 
                  className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full 
                    font-bold text-lg shrink-0
                    ${isError 
                      ? 'bg-destructive/20 text-destructive border-2 border-destructive' 
                      : 'bg-success/20 text-success border-2 border-success'
                    }
                  `}
                >
                  {step?.step ?? idx + 1}
                </div>

                {/* Content */}
                <div 
                  className={`
                    flex-1 p-4 rounded-lg border
                    ${isError 
                      ? 'bg-destructive/5 border-destructive/30' 
                      : 'bg-success/5 border-success/30'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1 font-medium">
                        L1 Logic Pattern
                      </div>
                      <p className="text-sm">{step?.l1Logic ?? 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">produces</span>
                  </div>

                  <div className="flex items-start gap-2">
                    {isError ? (
                      <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 font-medium">
                        L2 Result
                      </div>
                      <p className={`text-sm font-mono ${isError ? 'text-destructive' : 'text-success'}`}>
                        {step?.l2Result ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DecisionTree;
