import { motion } from "framer-motion";
import type { EtymologyAnalysis } from "@/lib/labStore";
import { Network, Globe, History } from "lucide-react";

interface ConnectionWebProps {
  connections: EtymologyAnalysis["connections"];
  rootGroups: EtymologyAnalysis["rootGroups"];
}

const ConnectionWeb = ({ connections, rootGroups }: ConnectionWebProps) => {
  // Helper to determine if a language is "Proto" or "Ancient"
  const isAncient = (lang: string) => {
    const l = lang.toLowerCase();
    return l.includes("proto") || l.includes("ancient") || l.includes("old") || ["latin", "greek", "sanskrit", "pali"].includes(l);
  };

  // Logic: Ancestors get "Prestige" colors, Moderns get a unified "Leaf" color
  const getLangStyles = (lang: string) => {
    if (!isAncient(lang)) {
      return "bg-blue-500/5 border-blue-200 text-blue-700 dark:text-blue-300 dark:border-blue-500/20";
    }
    if (lang.toLowerCase().includes("indo-european")) return "bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300";
    if (lang.toLowerCase().includes("germanic")) return "bg-purple-500/20 border-purple-500/40 text-purple-700 dark:text-purple-300";
    if (lang.toLowerCase().includes("latin") || lang.toLowerCase().includes("italic")) return "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300";
    return "bg-slate-800 text-white border-slate-700";
  };

  const safeConnections = connections ?? [];
  const safeRootGroups = rootGroups ?? [];

  if (safeConnections.length === 0 && safeRootGroups.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-3xl opacity-50">
        <History className="h-12 w-12 mx-auto mb-4" />
        <p className="font-medium">No linguistic lineage found for these tokens.</p>
      </div>
    );
  }

  return (
    <div className="space-y-32 pb-20">
      {safeConnections.map((connection, idx) => (
        <div key={connection?.id ?? idx} className="flex flex-col items-center w-full max-w-6xl mx-auto">
          
          {/* 1. ANCESTOR (The Root) */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative z-20"
          >
            <div className={`px-6 py-3 rounded-xl border-2 font-mono shadow-lg transition-transform group-hover:scale-105 ${getLangStyles(connection.rootLanguage)}`}>
              <div className="text-[10px] uppercase tracking-widest font-black opacity-70 mb-1 text-center">
                {connection.rootLanguage}
              </div>
              <div className="text-2xl font-bold">*{connection.root}</div>
            </div>
            <div className="absolute top-full mt-2 w-48 left-1/2 -translate-x-1/2 text-center">
                <p className="text-xs italic text-muted-foreground bg-background/80 px-2 py-1 rounded-full border shadow-sm">
                  "{connection.meaning}"
                </p>
            </div>
          </motion.div>

          {/* 2. THE FOCUS WORD (The Central Junction) */}
          <div className="relative flex flex-col items-center mt-16 mb-20 w-full">
            {/* Trunk Line from Ancestor */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-amber-500/50 to-primary" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="z-20"
            >
              <div className="px-12 py-6 rounded-2xl bg-primary text-primary-foreground font-black text-4xl shadow-2xl border-4 border-background ring-8 ring-primary/10">
                {connection.word}
              </div>
            </motion.div>

            {/* 3. THE BRANCHING SVG (The / \ Lines) */}
            {connection.cognates && connection.cognates.length > 0 && (
              <div className="absolute top-full left-0 w-full h-24 overflow-visible pointer-events-none">
                <svg className="w-full h-full">
                  {connection.cognates.map((_, cIdx) => {
                    const total = connection.cognates.length;
                    // Logic: Distribute end-points across 100% width
                    const xEnd = `${(100 / (total + 1)) * (cIdx + 1)}%`;
                    return (
                      <motion.path
                        key={cIdx}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 0.3 + cIdx * 0.1, duration: 0.8 }}
                        // M 50% 0 (Middle-Top) to XEnd 100% (Spread bottom)
                        d={`M 50% 0 L ${xEnd} 80`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="text-primary/30"
                      />
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* 4. COGNATES (The Branches) */}
          {connection.cognates && connection.cognates.length > 0 && (
            <div className="flex justify-between items-start w-full gap-4 px-4">
              {connection.cognates.map((cognate, cIdx) => (
                <motion.div
                  key={cIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + 0.1 * cIdx }}
                  className="flex flex-col items-center text-center flex-1 min-w-[120px]"
                >
                  <div className={`w-full p-4 rounded-2xl border-2 shadow-sm group transition-all hover:scale-105 hover:shadow-lg ${getLangStyles(cognate.language)}`}>
                    <span className="text-[10px] uppercase font-bold opacity-60 block mb-1 tracking-tighter">
                      {cognate.language}
                    </span>
                    <span className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                      {cognate.word}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* FOOTER: SEMANTIC CLUSTERS */}
      {safeRootGroups.length > 0 && (
        <section className="bg-muted/30 p-10 rounded-[3rem] border border-border/50 max-w-6xl mx-auto">
          <h4 className="font-black text-2xl flex items-center gap-3 mb-8 uppercase tracking-tighter text-primary/80">
            <Globe className="h-7 w-7" />
            Common Root Clusters
          </h4>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {safeRootGroups.map((group, idx) => (
              <div key={idx} className="bg-background p-6 rounded-3xl border-b-4 border-r-4 border-primary/10 hover:border-primary/40 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono font-black text-2xl text-primary leading-none group-hover:scale-110 transition-transform block">
                    *{group?.root}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase py-1 px-3 bg-muted rounded-full">
                    {group?.meaning}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed">
                  {group.words.map((word, wIdx) => (
                    <span key={wIdx} className="text-sm font-semibold opacity-60 hover:opacity-100 hover:text-primary transition-all cursor-default">
                      {word}{wIdx < group.words.length - 1 ? " •" : ""}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ConnectionWeb;
