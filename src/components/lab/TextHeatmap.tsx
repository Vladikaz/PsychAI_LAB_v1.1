import { motion } from "framer-motion";
import type { CognitiveAnalysis } from "@/lib/labStore";
import { Thermometer } from "lucide-react";

interface TextHeatmapProps {
  segments: CognitiveAnalysis["heatmapSegments"];
}

const TextHeatmap = ({ segments }: TextHeatmapProps) => {
  const safeSegments = segments ?? [];

  const getHeatColor = (load: number): string => {
    const safeLoad = typeof load === 'number' ? load : 50;
    if (safeLoad < 20) return "bg-emerald-200/80 dark:bg-emerald-800/50";
    if (safeLoad < 40) return "bg-lime-200/80 dark:bg-lime-800/50";
    if (safeLoad < 60) return "bg-yellow-200/80 dark:bg-yellow-800/50";
    if (safeLoad < 80) return "bg-orange-200/80 dark:bg-orange-800/50";
    return "bg-red-300/80 dark:bg-red-800/50";
  };

  const getTextColor = (load: number): string => {
    const safeLoad = typeof load === 'number' ? load : 50;
    if (safeLoad < 40) return "text-emerald-900 dark:text-emerald-100";
    if (safeLoad < 70) return "text-amber-900 dark:text-amber-100";
    return "text-red-900 dark:text-red-100";
  };

  if (safeSegments.length === 0) {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-primary" />
          Complexity Heatmap
        </h4>

        <div className="text-center py-8 text-muted-foreground">
          <Thermometer className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No heatmap data available for this text.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg flex items-center gap-2">
        <Thermometer className="h-5 w-5 text-primary" />
        Complexity Heatmap
      </h4>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-lg bg-card border leading-relaxed text-lg"
      >
        {safeSegments.map((segment, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.03 }}
            className={`
              inline px-0.5 py-1 rounded
              ${getHeatColor(segment?.load ?? 50)}
              ${getTextColor(segment?.load ?? 50)}
              transition-colors duration-200
            `}
            title={`Load: ${segment?.load ?? 0}%`}
          >
            {segment?.text ?? ''}
          </motion.span>
        ))}
      </motion.div>

      {/* Color Scale Legend */}
      <div className="flex items-center justify-center gap-1">
        <span className="text-xs text-muted-foreground mr-2">Low</span>
        <div className="flex rounded overflow-hidden">
          <div className="w-8 h-4 bg-emerald-300" />
          <div className="w-8 h-4 bg-lime-300" />
          <div className="w-8 h-4 bg-yellow-300" />
          <div className="w-8 h-4 bg-orange-300" />
          <div className="w-8 h-4 bg-red-400" />
        </div>
        <span className="text-xs text-muted-foreground ml-2">High</span>
      </div>
    </div>
  );
};

export default TextHeatmap;
