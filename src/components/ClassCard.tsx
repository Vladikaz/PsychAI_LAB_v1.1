import { FolderOpen, Users, Sparkles } from "lucide-react";

interface ClassCardProps {
  id: string;
  name: string;
  studentCount: number;
  hasSummary: boolean;
  onClick: () => void;
}

const ClassCard = ({ name, studentCount, hasSummary, onClick }: ClassCardProps) => {
  return (
    <button
      onClick={onClick}
      className="academic-card p-6 text-left w-full group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <FolderOpen className="h-5 w-5" />
        </div>
        {hasSummary && (
          <div className="flex items-center gap-1 text-xs text-success">
            <Sparkles className="h-3 w-3" />
            <span>Synthesized</span>
          </div>
        )}
      </div>
      
      <h3 className="font-semibold text-lg mb-2 font-serif text-foreground group-hover:text-primary transition-colors">
        {name}
      </h3>
      
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{studentCount} {studentCount === 1 ? "student" : "students"}</span>
      </div>
    </button>
  );
};

export default ClassCard;
