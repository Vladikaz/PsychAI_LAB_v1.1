import { motion } from "framer-motion";
import type { InterferenceAnalysis } from "@/lib/labStore";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface BridgeSchemaProps {
  bridges: InterferenceAnalysis["bridges"];
}

const BridgeSchema = ({ bridges }: BridgeSchemaProps) => {
  const typeColors: Record<string, string> = {
    grammatical: "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300",
    lexical: "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
    phonetic: "bg-purple-500/20 border-purple-500/40 text-purple-700 dark:text-purple-300",
  };

  const safeBridges = bridges ?? [];

  if (safeBridges.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>No positive transfer bridges found for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-success" />
        Bridge Schema — Positive Transfer
      </h4>
      
      <div className="space-y-3">
        {safeBridges.map((bridge, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-lg border ${typeColors[bridge?.type ?? 'grammatical'] ?? typeColors.grammatical}`}
          >
            <div className="flex items-center gap-4 mb-3">
              {/* L1 Concept */}
              <div className="flex-1 p-3 bg-background rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">L1 (Native)</div>
                <div className="font-medium">{bridge?.l1Concept ?? 'N/A'}</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center">
                <ArrowRight className="h-6 w-6" />
                <span className="text-xs mt-1 capitalize">{bridge?.transferType ?? 'positive'}</span>
              </div>

              {/* L2 Concept */}
              <div className="flex-1 p-3 bg-background rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">L2 (Target)</div>
                <div className="font-medium">{bridge?.l2Concept ?? 'N/A'}</div>
              </div>
            </div>

            <p className="text-sm opacity-80">{bridge?.explanation ?? ''}</p>
            
            <div className="mt-2">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-background/50 capitalize">
                {bridge?.type ?? 'grammatical'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BridgeSchema;
