import { motion } from "framer-motion";
import type { EtymologyAnalysis } from "@/lib/labStore";
import { Network, Globe, ArrowDown, History } from "lucide-react";

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
    
    // Assign different colors to different Proto-branches
    if (lang.toLowerCase().includes("indo-european")) return "bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300";
    if (lang.toLowerCase().includes("germanic")) return "bg-purple-500/20 border-purple-500/40 text-purple-700 dark:text-purple-300";
    if (lang.toLowerCase().includes("latin") || lang.toLowerCase().includes("italic")) return "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300";
    
    return "bg-slate-800 text-white border-slate-700"; // Default Ancient
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
    <div className="space-y-20 pb-20">
      {safeConnections.map((connection, idx) => (
        <div key={connection?.id ?? idx} className="flex flex-col items-center w-full">
          
          {/* ANCESTOR NODE (Top) */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
          >
            <div className={`px-5 py-2.5 rounded-xl border-2 font-mono shadow-md transition-transform group-hover:scale-105 ${getLangStyles(connection.rootLanguage)}`}>
              <div className="text-[10px] uppercase tracking-widest font-black opacity-70 mb-1 text-center">
                {connection.rootLanguage}
              </div>
              <div className="text-xl font-bold">*{connection.root}</div>
            </div>
            <div className="absolute top-full mt-2 w-48 left-1/2 -translate-x-1/2 text-center">
               <p className="text-xs italic text-muted-foreground bg-background px-2 py-1 rounded">
                 "{connection.meaning}"
               </p>
            </div>
          </motion.div>

          {/* VERTICAL DESCENT LINE */}
          <div className="w-px h-16 bg-gradient-to-b from-border via-primary/40 to-primary relative mt-8">
             <div className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-primary" />
          </div>

          {/* FOCUS WORD (The Bridge) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative z-10 -mt-2"
          >
            <div className="px-10 py-5 rounded-full bg-primary text-primary-foreground font-black text-3xl shadow-[0_0_40px_rgba(var(--primary),0.3)] border-4 border-background">
              {connection.word}
            </div>
          </motion.div>

          {/* MODERN DERIVATIONS (Horizontal Branches) */}
          {connection.cognates && connection.cognates.length > 0 && (
            <div className="w-full mt-10 relative">
              {/* Horizontal Branching Line */}
              <div className="absolute top-0 left-[15%] right-[15%] h-px bg-primary/20 hidden md:block" />
              
              <div className="flex flex-wrap md:flex-nowrap justify-center gap-4 md:gap-6 pt-8">
                {connection.cognates.map((cognate, cIdx) => (
                  <motion.div
                    key={cIdx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * cIdx }}
                    className="flex flex-col items-center flex-1 min-w-[140px]"
                  >
                    {/* Connection Line */}
                    <div className="hidden md:block w-px h-8 bg-primary/20 -mt-8 mb-4" />
                    
                    <div className={`w-full p-4 rounded-2xl border text-center group transition-all hover:shadow-lg ${getLangStyles(cognate.language)}`}>
                      <span className="text-[9px] uppercase font-bold opacity-50 block mb-1">
                        {cognate.language}
                      </span>
                      <span className="font-bold text-lg group-hover:text-primary transition-colors">
                        {cognate.word}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* FOOTER: SEMANTIC CLUSTERS */}
      {safeRootGroups.length > 0 && (
        <section className="bg-muted/30 p-8 rounded-[2rem] border border-border/50">
          <h4 className="font-black text-xl flex items-center gap-3 mb-8 uppercase tracking-tight">
            <Globe className="h-6 w-6 text-primary" />
            Common Root Clusters
          </h4>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {safeRootGroups.map((group, idx) => (
              <div key={idx} className="bg-background p-6 rounded-2xl border-b-4 border-r-4 border-primary/10 hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono font-bold text-xl text-primary leading-none">*{group?.root}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase py-1 px-2 bg-muted rounded">
                    {group?.meaning}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.words.map((word, wIdx) => (
                    <span key={wIdx} className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">
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
