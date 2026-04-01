import { motion } from "framer-motion";
import type { EtymologyAnalysis } from "@/lib/labStore";
import { Network, Globe } from "lucide-react";

interface ConnectionWebProps {
  connections: EtymologyAnalysis["connections"];
  rootGroups: EtymologyAnalysis["rootGroups"];
}

const ConnectionWeb = ({ connections, rootGroups }: ConnectionWebProps) => {
  const languageColors: Record<string, string> = {
    Russian: "bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-300",
    German: "bg-yellow-500/20 border-yellow-500/40 text-yellow-700 dark:text-yellow-300",
    French: "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300",
    Spanish: "bg-orange-500/20 border-orange-500/40 text-orange-700 dark:text-orange-300",
    Greek: "bg-purple-500/20 border-purple-500/40 text-purple-700 dark:text-purple-300",
    Latin: "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
    Italian: "bg-green-500/20 border-green-500/40 text-green-700 dark:text-green-300",
    Portuguese: "bg-teal-500/20 border-teal-500/40 text-teal-700 dark:text-teal-300",
    Dutch: "bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300",
  };

  const safeConnections = connections ?? [];
  const safeRootGroups = rootGroups ?? [];

  if (safeConnections.length === 0 && safeRootGroups.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Network className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>No etymological connections found for the provided words.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Word Connections */}
      {safeConnections.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Connection Web — Word Origins
          </h4>

          <div className="grid gap-6">
            {safeConnections.map((connection, idx) => (
              <motion.div
                key={connection?.id ?? idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                {/* Central Word */}
                <div className="flex items-center justify-center mb-4">
                  <div className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-xl shadow-lg">
                    {connection?.word ?? 'Unknown'}
                  </div>
                </div>

                {/* Root Info */}
                <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${languageColors[connection?.rootLanguage ?? ''] ?? 'bg-muted'}`}>
                    {connection?.rootLanguage ?? 'Unknown'}
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-mono text-sm">{connection?.root ?? 'N/A'}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm italic">"{connection?.meaning ?? 'N/A'}"</span>
                </div>

                {/* Cognates Fan */}
                {Array.isArray(connection?.cognates) && connection.cognates.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-3">
                    {connection.cognates.map((cognate, cIdx) => (
                      <motion.div
                        key={cIdx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 + cIdx * 0.05 }}
                        className={`relative px-4 py-2 rounded-lg border ${languageColors[cognate?.language ?? ''] ?? 'bg-muted border-muted'}`}
                      >
                        {/* Connection Line SVG */}
                        <svg 
                          className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-4"
                          style={{ overflow: 'visible' }}
                        >
                          <line 
                            x1="0" y1="16" x2="0" y2="0" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeDasharray="3 2"
                            className="text-border"
                          />
                        </svg>
                        
                        <div className="text-xs text-muted-foreground mb-0.5">
                          {cognate?.language ?? 'Unknown'}
                        </div>
                        <div className="font-medium">{cognate?.word ?? 'N/A'}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Root Groups */}
      {safeRootGroups.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-secondary" />
            Root Families
          </h4>

          <div className="grid gap-4 md:grid-cols-2">
            {safeRootGroups.map((group, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-lg bg-card border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono font-bold text-primary">{group?.root ?? 'N/A'}</span>
                  <span className="text-muted-foreground text-sm">— {group?.meaning ?? 'N/A'}</span>
                </div>
                
                {Array.isArray(group?.words) && group.words.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {group.words.map((word, wIdx) => (
                      <span 
                        key={wIdx}
                        className="px-2 py-1 rounded bg-muted text-sm"
                      >
                        {word ?? 'N/A'}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionWeb;
