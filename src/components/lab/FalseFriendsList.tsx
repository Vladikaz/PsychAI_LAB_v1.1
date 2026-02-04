import { motion } from "framer-motion";
import type { InterferenceAnalysis } from "@/lib/labStore";
import { AlertOctagon, ArrowLeftRight } from "lucide-react";

interface FalseFriendsListProps {
  falseFriends: InterferenceAnalysis["falseFriends"];
}

const FalseFriendsList = ({ falseFriends }: FalseFriendsListProps) => {
  const safeFalseFriends = falseFriends ?? [];

  if (safeFalseFriends.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertOctagon className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>No false friends detected for this language pair.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg flex items-center gap-2">
        <AlertOctagon className="h-5 w-5 text-amber-500" />
        False Friends Detector
      </h4>

      <div className="grid gap-3 md:grid-cols-2">
        {safeFalseFriends.map((pair, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
          >
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold">{pair?.l1Word ?? 'N/A'}</div>
                <div className="text-xs text-muted-foreground">L1</div>
              </div>
              
              <ArrowLeftRight className="h-4 w-4 text-amber-600" />
              
              <div className="text-center">
                <div className="text-lg font-bold">{pair?.l2Word ?? 'N/A'}</div>
                <div className="text-xs text-muted-foreground">L2</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-background rounded">
                <div className="text-xs text-muted-foreground mb-1">L1 Means</div>
                <div>{pair?.l1Meaning ?? 'N/A'}</div>
              </div>
              <div className="p-2 bg-background rounded">
                <div className="text-xs text-muted-foreground mb-1">L2 Means</div>
                <div>{pair?.l2Meaning ?? 'N/A'}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FalseFriendsList;
