import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LabUtilityCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  gradient: string;
  index: number;
}

const LabUtilityCard = ({ 
  title, 
  description, 
  icon: Icon, 
  route, 
  gradient,
  index 
}: LabUtilityCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.15, 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(route)}
      className={`
        relative overflow-hidden cursor-pointer rounded-2xl p-8
        bg-gradient-to-br ${gradient}
        shadow-lg hover:shadow-xl transition-shadow duration-300
        border border-white/20
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <motion.div 
            className="text-white/60 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.15 + 0.3 }}
          >
            Lab Tool
          </motion.div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-3 font-serif">
          {title}
        </h3>
        
        <p className="text-white/80 text-sm leading-relaxed">
          {description}
        </p>

        {/* Hover Arrow */}
        <motion.div 
          className="mt-6 flex items-center gap-2 text-white/70"
          whileHover={{ x: 5 }}
        >
          <span className="text-sm font-medium">Open Tool</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LabUtilityCard;
