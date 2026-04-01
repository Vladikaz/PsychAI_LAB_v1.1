import React from "react";
import { motion } from "framer-motion";
import { 
  Dna, 
  GitBranch, 
  Languages, 
  AlertCircle, 
  ChevronDown,
  History
} from "lucide-react";

// Updated Interface to match the new "Cascading Ancestry" Edge Function response
interface ConnectionWebProps {
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
}: ConnectionWebProps) => {

  // Empty State / Loading State
  if (!ancient_seed && (!intermediate_branches || intermediate_branches.length === 0)) {
    return (
      <div className="text-center py-12 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 dark:bg-slate-900/20 dark:border-slate-800">
        <History className="h-12 w-12 mx-auto mb-4 text-slate-300 opacity-50" />
        <p className="text-slate-500 font-medium italic">Ready to scan for ontological ancestry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      
      {/* 1. ANCIENT SEED - The Primary Root (Deep Past) */}
      {ancient_seed && (
        <section className="relative flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 w-full"
          >
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border-b-4 border-slate-700 text-center relative overflow-hidden">
              {/* Decorative DNA Background Icon */}
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
              
              {/* Hallucination / Substrate Guardrail check */}
              {(ancient_seed.language.toLowerCase().includes("unknown") || 
                ancient_seed.language.toLowerCase().includes("substrate")) && (
                <div className="mt-4 flex items-center justify-center gap-2 text-amber-400 text-[10px] bg-amber-400/10 p-2 rounded-md">
                  <AlertCircle className="h-3 w-3" />
                  Non-Standard or Disputed Origin
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Vertical Visual Connector */}
          <div className="h-10 w-1 bg-gradient-to-b from-slate-900 to-slate-400" />
          <ChevronDown className="h-5 w-5 text-slate-400 -mt-1 animate-bounce" />
        </section>
      )}

      {/* 2. INTERMEDIATE BRANCHES - Temporal Migration */}
      {intermediate_branches && intermediate_branches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-500 uppercase tracking-widest text-[10px] font-bold mb-2">
            <GitBranch className="h-3 w-3" />
            Intermediate Proto-Branches
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {intermediate_branches.map((branch, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -15 : 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
                className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border-l-4 border-slate-400 dark:border-slate-600 shadow-sm relative group"
              >
                <div className="text-[10px] font-bold text-slate-500 mb-1">
                  {branch.language}
                </div>
                <div className="text-xl font-mono font-bold text-slate-800 dark:text-slate-200">
                  {branch.form}
                </div>
                <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {branch.century}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 3. MODERN RELATIVES - Living Cognates */}
      {modern_relatives && modern_relatives.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-center gap-2 text-teal-600 dark:text-teal-400 uppercase tracking-widest text-[10px] font-bold mb-2">
            <Languages className="h-3 w-3" />
            Modern Living Cognates
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {modern_relatives.map((rel, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (idx * 0.05) }}
                className="p-3 rounded-xl border bg-white dark:bg-slate-900 border-teal-100 dark:border-teal-900/30 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="text-[9px] font-bold text-teal-600 mb-0.5 uppercase tracking-tighter">
                  {rel.lang}
                </div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
                  {rel.word}
                </div>
                <div className="text-[9px] text-slate-400 italic">
                  {rel.connection}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Footer Branding */}
      <footer className="text-center pt-8 opacity-30">
        <p className="text-[10px] italic font-medium">
          Linguistic Lab — PsychAI Ontological Scaffolding v2.5
        </p>
      </footer>
    </div>
  );
};

export default ConnectionWeb;
