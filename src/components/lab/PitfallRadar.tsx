import { motion } from "framer-motion";
import type { InterferenceAnalysis } from "@/lib/labStore";
import { AlertTriangle, XCircle, AlertCircle } from "lucide-react";

interface PitfallRadarProps {
  pitfalls: InterferenceAnalysis["pitfalls"];
}

const PitfallRadar = ({ pitfalls }: PitfallRadarProps) => {
  const severityConfig: Record<string, { icon: typeof XCircle; bg: string; badge: string }> = {
    high: {
      icon: XCircle,
      bg: "bg-destructive/10 border-destructive/30",
      badge: "bg-destructive text-destructive-foreground",
    },
    medium: {
      icon: AlertTriangle,
      bg: "bg-warning/10 border-warning/30",
      badge: "bg-warning text-warning-foreground",
    },
    low: {
      icon: AlertCircle,
      bg: "bg-muted border-muted-foreground/20",
      badge: "bg-muted-foreground/20 text-muted-foreground",
    },
  };

  const safePitfalls = pitfalls ?? [];

  if (safePitfalls.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>No negative interference pitfalls identified.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning" />
        Pitfall Radar — Negative Interference
      </h4>

      <div className="grid gap-4">
        {safePitfalls.map((pitfall, idx) => {
          const severity = pitfall?.severity ?? 'medium';
          const config = severityConfig[severity] ?? severityConfig.medium;
          const Icon = config.icon;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-lg border ${config.bg}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">L1 Pattern</h5>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.badge}`}>
                      {severity.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm">{pitfall?.l1Pattern ?? 'N/A'}</p>

                  <div className="p-3 bg-background rounded border-l-4 border-destructive">
                    <div className="text-xs text-muted-foreground mb-1">Likely L2 Error</div>
                    <p className="text-sm font-mono">{pitfall?.l2Error ?? 'N/A'}</p>
                  </div>

                  <p className="text-sm text-muted-foreground">{pitfall?.explanation ?? ''}</p>

                  {pitfall?.correction && (
                    <div className="p-3 bg-success/10 rounded border-l-4 border-success">
                      <div className="text-xs text-success mb-1 font-medium">Correction Strategy</div>
                      <p className="text-sm">{pitfall.correction}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PitfallRadar;
