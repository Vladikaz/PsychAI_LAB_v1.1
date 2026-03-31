import { motion } from "framer-motion";
import type { EtymologyAnalysis } from "@/lib/labStore";
import { Globe, History } from "lucide-react";

interface ConnectionWebProps {
  connections: EtymologyAnalysis["connections"];
  rootGroups: EtymologyAnalysis["rootGroups"];
}

const ConnectionWeb = ({ connections, rootGroups }: ConnectionWebProps) => {
  const isAncient = (lang: string) => {
    const l = lang.toLowerCase();
    return l.includes("proto") || l.includes("ancient") || l.includes("old") || ["latin", "greek", "sanskrit", "hittite", "gothic", "pali"].includes(l);
  };

  const getLangStyles = (lang: string) => {
    if (!isAncient(lang)) return "bg-blue-500/5 border-blue-200 text-blue-700 dark:text-blue-300 dark:border-blue-500/20";
    if (lang.toLowerCase().includes("indo-european")) return "bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300";
    if (lang.toLowerCase().includes("sino-tibetan")) return "bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300";
    if (lang.toLowerCase().includes("slavic")) return "bg-indigo-500/20 border-indigo-500/40 text-indigo-700 dark:text-indigo-300";
    return "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400";
  };

  const safeConnections = connections ?? [];

  return (
    /* 1. Added 'overflow-visible' and more vertical spacing */
    <div className="space-y-48 py-12 overflow-visible">
      {safeConnections.map((connection, idx) => (
        <div key={connection?.id ?? idx} className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 relative">
          
          {/* LEVEL 1: THE ANCESTOR ROOT */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-30 text-center"
          >
            <div className={`px-6 py-3 rounded-xl border-2 font-mono shadow-xl transition-transform hover:scale-105 ${getLangStyles(connection.rootLanguage)}`}>
              <div className="text-[10px] uppercase tracking-widest font-black opacity-70 mb-1 text-center">
                {connection.rootLanguage}
              </div>
              <div className="text-2xl font-bold">*{connection.root}</div>
            </div>
            <div className="mt-4">
              <span className="text-xs italic text-muted-foreground bg-background/90 px-4 py-1.5 rounded-full border border-dashed shadow-sm backdrop-blur-sm">
                "{connection.meaning}"
              </span>
            </div>
          </motion.div>

          {/* 2. THE TRUNK (Vertical line - Bolded) */}
          <div className="h-24 w-px bg-gradient-to-b from-amber-500/60 via-primary/60 to-primary relative">
            <div className="absolute inset-0 w-px h-full border-r-[3px] border-dotted border-primary/30" />
          </div>

          {/* LEVEL 2: THE TARGET WORD (The Junction) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-30 relative"
          >
            <div className="px-14 py-7 rounded-full bg-primary text-primary-foreground font-black text-4xl shadow-[0_20px_60px_rgba(var(--primary),0.4)] border-4 border-background ring-[12px] ring-primary/5">
              {connection.word}
            </div>
          </motion.div>

          {/* 3. THE BRANCHES (Diagonal SVG Lines) */}
          {connection.cognates && connection.cognates.length > 0 && (
            <div className="w-full relative pt-24">
              
              {/* THE SVG BRANCHING ENGINE - Increased strokeWidth and height */}
              <svg 
                className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none" 
                style={{ height: '120px', transform: 'translateY(-30px)' }}
              >
                {connection.cognates.map((_, cIdx) => {
                  const total = connection.cognates.length;
                  const xEnd = `${(100 / (total + 1)) * (cIdx + 1)}%`;
                  return (
                    <motion.path
                      key={cIdx}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 0.4 + cIdx * 0.1, duration: 0.7 }}
                      /* Drawing from center-top to spread-bottom */
                      d={`M 50% 0 L ${xEnd} 100`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                      strokeDasharray="1 10" 
                      className="text-primary/40 dark:text-primary/60"
                    />
                  );
                })}
              </svg>

              {/* LEVEL 4: MODERN COGNATES */}
              <div className="flex justify-between items-start w-full gap-4 relative z-20">
                {connection.cognates.map((cognate, cIdx) => (
                  <motion.div
                    key={cIdx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + 0.1 * cIdx }}
                    className="flex-1 flex flex-col items-center min-w-[130px]"
                  >
                    <div className={`w-full p-5 rounded-[2rem] border-2 shadow-2xl group hover:-translate-y-3 transition-all ${getLangStyles(cognate.language)}`}>
                      <span className="text-[10px] uppercase font-bold opacity-60 block mb-1 tracking-tighter text-center leading-none">
                        {cognate.language}
                      </span>
                      <span className="font-bold text-lg leading-tight group-hover:text-primary transition-colors text-center block">
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
    </div>
  );
};

export default ConnectionWeb;
