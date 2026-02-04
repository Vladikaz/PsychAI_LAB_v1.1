import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseWithDevice } from "@/lib/supabaseClient";
import { Save, Sparkles, Loader2, CheckCircle, FileText, Trash2 } from "lucide-react";
import { getDemoScopeId } from "@/lib/demoScope";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StudentProfileProps {
  studentId: string;
  numericId: number;
  classId: string;
  className: string;
  onDelete?: () => void;
}

interface DosDonts {
  dos: string[];
  donts: string[];
}

const parseDosDonts = (data: string | null): DosDonts | null => {
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return {
      dos: Array.isArray(parsed.dos) ? parsed.dos : [],
      donts: Array.isArray(parsed.donts) ? parsed.donts : [],
    };
  } catch {
    // If not JSON, return null to display raw text
    return null;
  }
};

const StudentProfile = ({ studentId, numericId, classId, onDelete }: StudentProfileProps) => {
  const [notes, setNotes] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const queryClient = useQueryClient();

  const { data: student, isLoading } = useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const { data, error } = await supabaseWithDevice
        .from("students")
        .select("*")
        .eq("id", studentId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (student?.raw_notes !== undefined) {
      setNotes(student.raw_notes || "");
      setHasUnsavedChanges(false);
    }
  }, [student?.raw_notes]);

  const saveNotes = useMutation({
    mutationFn: async () => {
      const { error } = await supabaseWithDevice
        .from("students")
        .update({ raw_notes: notes })
        .eq("id", studentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      setHasUnsavedChanges(false);
      toast.success("Notes saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save notes: " + error.message);
    },
  });

  const analyzeStudent = useMutation({
    mutationFn: async () => {
      // First save notes if there are unsaved changes
      if (hasUnsavedChanges) {
        const { error: saveError } = await supabaseWithDevice
          .from("students")
          .update({ raw_notes: notes })
          .eq("id", studentId);
        if (saveError) throw saveError;
      }

      if (!notes.trim()) {
        throw new Error("Please enter observation notes before analyzing");
      }

      const response = await supabaseWithDevice.functions.invoke("analyze-student", {
        headers: {
          "x-device-id": getDemoScopeId(),
        },
        body: { student_id: numericId, notes: notes },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data.error) throw new Error(response.data.error);

      // Update student with AI analysis
      const { error: updateError } = await supabaseWithDevice
        .from("students")
        .update({
          raw_notes: notes,
          ai_personality_tag: response.data.personality_tag,
          ai_full_portrait: response.data.full_portrait,
          ai_dos_donts: response.data.dos_donts,
        })
        .eq("id", studentId);

      if (updateError) throw updateError;

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setHasUnsavedChanges(false);
      toast.success("Analysis complete");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteStudent = useMutation({
    mutationFn: async () => {
      const { error } = await supabaseWithDevice
        .from("students")
        .delete()
        .eq("id", studentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", classId] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Student deleted successfully");
      onDelete?.();
    },
    onError: (error) => {
      toast.error("Failed to delete student: " + error.message);
    },
  });

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasUnsavedChanges(value !== (student?.raw_notes || ""));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fade-in space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <span className="numeric-badge text-lg px-4 py-2">{numericId}</span>
            {student?.ai_personality_tag && (
              <span className="personality-tag">{student.ai_personality_tag}</span>
            )}
          </div>
          <p className="text-muted-foreground mt-2">Student Profile</p>
        </div>
      </div>

      {/* Raw Notes Input */}
      <div className="academic-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Observation Notes</h3>
          </div>
          {hasUnsavedChanges && (
            <span className="text-xs text-warning">Unsaved changes</span>
          )}
        </div>
        
        <Textarea
          placeholder="Enter your observations about this student's behavior, learning patterns, social interactions, and any notable characteristics..."
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          className="min-h-[200px] resize-y"
        />
        
        <div className="flex gap-3 mt-4">
          <Button
            onClick={() => saveNotes.mutate()}
            disabled={saveNotes.isPending || !hasUnsavedChanges}
            variant="outline"
            className="flex items-center gap-2"
          >
            {saveNotes.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Notes
          </Button>
          
          <Button
            onClick={() => analyzeStudent.mutate()}
            disabled={analyzeStudent.isPending || !notes.trim()}
            className="analysis-button flex items-center gap-2"
          >
            {analyzeStudent.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Produce Analysis
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      {student?.ai_full_portrait && (
        <div className="space-y-6 slide-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <h3 className="text-xl font-semibold font-serif">AI-Generated Insights</h3>
          </div>

          {/* Psychological Portrait */}
          <div className="insight-section">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
              Psychological Portrait
            </h4>
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {student.ai_full_portrait}
            </div>
          </div>

          {/* Pedagogical Recommendations */}
          {student.ai_dos_donts && (
            <div className="insight-section">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                Pedagogical Recommendations
              </h4>
              {(() => {
                const parsed = parseDosDonts(student.ai_dos_donts);
                if (parsed) {
                  return (
                    <div className="grid gap-6 md:grid-cols-2">
                      {parsed.dos.length > 0 && (
                        <div>
                          <h5 className="font-medium text-success mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Do's
                          </h5>
                          <ul className="space-y-2">
                            {parsed.dos.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-success mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {parsed.donts.length > 0 && (
                        <div>
                          <h5 className="font-medium text-destructive mb-2 flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Don'ts
                          </h5>
                          <ul className="space-y-2">
                            {parsed.donts.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-destructive mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                    {student.ai_dos_donts}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Empty State for AI */}
      {!student?.ai_full_portrait && (
        <div className="academic-card p-12 text-center">
          <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-muted-foreground">No analysis yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Enter observation notes and click "Produce Analysis" to generate psychological insights
          </p>
        </div>
      )}

      {/* Delete Student */}
      <div className="pt-8 border-t border-border">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Student
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Student #{numericId}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this student's profile,
                observation notes, and all AI-generated insights.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteStudent.mutate()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteStudent.isPending ? "Deleting..." : "Delete Student"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default StudentProfile;
