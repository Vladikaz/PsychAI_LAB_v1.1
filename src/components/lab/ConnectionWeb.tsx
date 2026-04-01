import React from "react";
import { motion } from "framer-motion";
import { 
  Dna, 
  GitBranch, 
  Languages, 
  AlertCircle, 
  ArrowDown 
} from "lucide-react";

// Update the interface to match our new Cascading Ancestry prompt structure
interface EtymologyTimelineProps {
  ancient_seed?: {
    form: string;
    language: string;
    meaning: string;
    color_token: string;
  };
  intermediate_branches?: Array<{
    form: string;
    language: string;
    century: string;
    color_token: string;
  }>;
  modern_relatives?: Array<{
    word: string;
    lang: string;
    connection: string;
    color_token: string;
  }>;
}

const ConnectionWeb = ({ 
  ancient_seed, 
  intermediate_branches, 
  modern_relatives 
}: EtymologyTimelineProps) => {

  // Return empty state if no data
  if (!ancient_seed && !intermediate_branches && !modern_relatives) {
    return (
      <div className="text-center py-12 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
        <Dna className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500 font-medium">Ready to scan for ontological ancestry...</p>
      </div>
    );
  }

  // Handle the "Substrate/Unknown" guardrail
  const isUnknownOrigin = ancient_seed?.language.toLowerCase().includes("unknown") || 
                          ancient_seed?.language.toLowerCase().includes("substrate");

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      
      {/* 1. ANCIENT SEED - The Foundation */}
      {ancient_seed && (
        <section className="relative flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 w-full max-w-sm"
          >
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border-b-4 border-slate-700 text-center relative overflow-hidden">
              {/* Decorative DNA Background */}
              <Dna className="absolute -right-4 -top-4 h-24 w-24 text-white/5 rotate-12" />
              
              <div className="flex items-center justify-center gap-2 mb-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <Dna className="h-3 w-3" />
                Primary Ancient Seed
              </div>
              <h2 className="text-4xl font-serif font-bold mb-1 tracking-tight">
                {ancient_seed.form}
              </h2>
              <p className="text-slate-400 text-sm font-medium mb-3 italic">
                {ancient_seed.language}
              </p>
              <div className="bg-white/10 px-4 py-2 rounded-lg inline-block text-sm border border-white/5 backdrop-blur-sm">
                "{ancient_seed.meaning}"
              </div>
              
              {isUnknownOrigin && (
                <div className="mt-4 flex items-center justify-center gap-2 text-amber-400 text-xs bg-amber-400/10 p-2 rounded-md">
                  <AlertCircle className="h-3 w-3" />
                  Non-standard or Substrate Origin
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Vertical Connecting Line */}
          <div className="h-12 w-1 bg-gradient-to-b from-slate-900 to-slate-400" />
        </section>
      )}

      {/* 2. INTERMEDIATE BRANCHES - The Migration */}
      {intermediate_branches && intermediate_branches.length > 0 && (
        <section className="relative space-y-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-slate-500 uppercase tracking-widest text-[10px] font-bold mb-4">
              <GitBranch className="h-3 w-3" />
              Proto-Migration Branches
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {intermediate_branches.map((branch, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.1) }}
                  className="bg-slate-700 text-slate-100 p-4 rounded-xl border-l-4 border-slate-500 shadow-md relative"
                >
                  <div className="text-[10px] font-bold text-slate-400 mb-1">{branch.language}</div>
                  <div className="text-xl font-mono font-semibold">{branch.form}</div>
                  <div className="absolute top-4 right-4 text-[9px] bg-black/20 px-2 py-0.5 rounded text-slate-400 font-mono">
                    {branch.century}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-center pt-2">
            <ArrowDown className="h-6 w-6 text-slate-300 animate-bounce" />
          </div>
        </section>
      )}

      {/* 3. MODERN RELATIVES - The Living Word */}
      {modern_relatives && modern_relatives.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-teal-600 uppercase tracking-widest text-[10px] font-bold mb-4">
            <Languages className="h-3 w-3" />
            Modern Living Cognates
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {modern_relatives.map((relative, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (idx * 0.05) }}
                className="bg-white p-3 rounded-xl border border-teal-100 shadow-sm hover:shadow-md transition-shadow group cursor-default"
              >
                <div className="text-[9px] font-bold text-teal-600 mb-0.5 uppercase tracking-tighter">
                  {relative.lang}
                </div>
                <div className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                  {relative.word}
                </div>
                <div className="text-[8px] text-slate-400 font-medium">
                  {relative.connection}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 4. FOOTER NOTE */}
      <footer className="text-center pt-8">
        <p className="text-[10px] text-slate-400 italic">
          Scanned via Linguistic Lab — Powered by Gemini 2.5 Flash Lite
        </p>
      </footer>
    </div>
  );
};

export default ConnectionWeb;
