import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Line,
} from "recharts";
import type { CognitiveAnalysis } from "@/lib/labStore";
import { TrendingUp, Gauge } from "lucide-react";

interface CognitiveLoadGraphProps {
  graphData: CognitiveAnalysis["graphData"];
  overallScore: number;
}

const CognitiveLoadGraph = ({ graphData, overallScore }: CognitiveLoadGraphProps) => {
  const safeScore = typeof overallScore === 'number' ? overallScore : 50;
  const safeGraphData = graphData ?? [];

  const getScoreColor = (score: number) => {
    if (score < 40) return "text-success";
    if (score < 70) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score < 40) return "Low Complexity";
    if (score < 70) return "Moderate Complexity";
    return "High Complexity";
  };

  if (safeGraphData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Mental Effort Timeline
          </h4>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-card border"
          >
            <Gauge className={`h-8 w-8 ${getScoreColor(safeScore)}`} />
            <div>
              <div className={`text-2xl font-bold ${getScoreColor(safeScore)}`}>
                {safeScore}
              </div>
              <div className="text-xs text-muted-foreground">
                {getScoreLabel(safeScore)}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No graph data available for visualization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Mental Effort Timeline
        </h4>

        {/* Overall Score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-card border"
        >
          <Gauge className={`h-8 w-8 ${getScoreColor(safeScore)}`} />
          <div>
            <div className={`text-2xl font-bold ${getScoreColor(safeScore)}`}>
              {safeScore}
            </div>
            <div className="text-xs text-muted-foreground">
              {getScoreLabel(safeScore)}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-80 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={safeGraphData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <defs>
              <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.5}
            />
            
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              label={{ 
                value: 'Cognitive Load', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' }
              }}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 'bold' }}
              formatter={(value: number) => [`${value ?? 0}%`, 'Mental Effort']}
            />

            {/* Threshold Lines */}
            <ReferenceLine 
              y={70} 
              stroke="hsl(var(--destructive))" 
              strokeDasharray="5 5"
              label={{ 
                value: 'High Load', 
                position: 'right', 
                fill: 'hsl(var(--destructive))',
                fontSize: 10
              }}
            />
            <ReferenceLine 
              y={40} 
              stroke="hsl(var(--warning))" 
              strokeDasharray="5 5"
              label={{ 
                value: 'Moderate', 
                position: 'right', 
                fill: 'hsl(var(--warning))',
                fontSize: 10
              }}
            />

            <Area
              type="monotone"
              dataKey="mentalEffort"
              stroke="none"
              fill="url(#colorLoad)"
            />

            <Line
              type="monotone"
              dataKey="mentalEffort"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ 
                fill: 'hsl(var(--primary))', 
                strokeWidth: 2,
                r: 4
              }}
              activeDot={{ 
                r: 6, 
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-muted-foreground">Low (0-40)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-muted-foreground">Moderate (40-70)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">High (70-100)</span>
        </div>
      </div>
    </div>
  );
};

export default CognitiveLoadGraph;
