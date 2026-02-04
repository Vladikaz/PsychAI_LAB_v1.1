import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseWithDevice } from "@/lib/supabaseClient";
import { Plus, Sparkles, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";
import { getDemoScopeId } from "@/lib/demoScope";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface ClassViewProps {
  classId: string;
  className: string;
  onStudentClick: (studentId: string, numericId: number) => void;
  onDelete?: () => void;
}

const ClassView = ({ classId, className, onStudentClick, onDelete }: ClassViewProps) => {
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentId, setNewStudentId] = useState("");
  const [idError, setIdError] = useState("");
  const queryClient = useQueryClient();

  const { data: classData } = useQuery({
    queryKey: ["class", classId],
    queryFn: async () => {
      const { data, error } = await supabaseWithDevice
        .from("classes")
        .select("*")
        .eq("id", classId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ["students", classId],
    queryFn: async () => {
      const { data, error } = await supabaseWithDevice
        .from("students")
        .select("*")
        .eq("class_id", classId)
        .order("student_numeric_id", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addStudent = useMutation({
    mutationFn: async (numericId: number) => {
      const deviceId = getDemoScopeId();
      const { data, error } = await supabaseWithDevice
        .from("students")
        .insert({ student_numeric_id: numericId, class_id: classId, device_id: deviceId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", classId] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setNewStudentId("");
      setIsAddingStudent(false);
      toast.success("Student added successfully");
    },
    onError: (error) => {
      if (error.message.includes("duplicate")) {
        toast.error("A student with this ID already exists in this class");
      } else {
        toast.error("Failed to add student: " + error.message);
      }
    },
  });

const synthesizeClass = useMutation({
  mutationFn: async () => {
    const studentsWithPortraits = students?.filter(s => s.ai_full_portrait) || [];
    
    if (studentsWithPortraits.length === 0) {
      throw new Error("No analyzed students found. Please analyze individual students first.");
    }

    const response = await supabaseWithDevice.functions.invoke("synthesize-class", {
      headers: {
        "x-device-id": getDemoScopeId(),
      },
      body: {
        class_name: className,
        student_portraits: studentsWithPortraits.map(s => ({
          student_id: s.student_numeric_id,
          portrait: s.ai_full_portrait,
          tag: s.ai_personality_tag || "Unknown",
        })),
      },
    });

    if (response.error) throw new Error(response.error.message);
    
    // ПРОВЕРКА ИМЕНИ ПОЛЯ:
    // Берем global_strategy (из новой функции) или summary (старый вариант)
    const strategyData = response.data.global_strategy || response.data.summary || response.data.content;
    
    if (!strategyData) throw new Error("AI returned empty strategy");

    // Обновляем базу данных правильным значением
    const { error: updateError } = await supabaseWithDevice
      .from("classes")
      .update({ class_summary: strategyData }) 
      .eq("id", classId);

    if (updateError) throw updateError;

    return response.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["class", classId] });
    toast.success("Class strategy synthesized successfully");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

  const deleteClass = useMutation({
    mutationFn: async () => {
      // Delete all students first (cascade)
      const { error: studentsError } = await supabaseWithDevice
        .from("students")
        .delete()
        .eq("class_id", classId);
      if (studentsError) throw studentsError;

      // Then delete the class
      const { error: classError } = await supabaseWithDevice
        .from("classes")
        .delete()
        .eq("id", classId);
      if (classError) throw classError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class and all students deleted successfully");
      onDelete?.();
    },
    onError: (error) => {
      toast.error("Failed to delete class: " + error.message);
    },
  });

  const handleStudentIdChange = (value: string) => {
    setNewStudentId(value);
    if (value && !/^\d+$/.test(value)) {
      setIdError("Student ID must contain only numbers");
    } else {
      setIdError("");
    }
  };

  const handleAddStudent = () => {
    if (!newStudentId.trim()) {
      toast.error("Please enter a student ID");
      return;
    }
    if (!/^\d+$/.test(newStudentId)) {
      toast.error("Student ID must contain only numbers");
      return;
    }
    addStudent.mutate(parseInt(newStudentId, 10));
  };

  const analyzedCount = students?.filter(s => s.ai_full_portrait).length || 0;

  return (
    <div className="fade-in space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold font-serif text-foreground">{className}</h2>
          <p className="text-muted-foreground mt-1">
            {students?.length || 0} students • {analyzedCount} analyzed
          </p>
        </div>
        
        <div className="flex gap-3">
          {!isAddingStudent && (
            <Button
              onClick={() => setIsAddingStudent(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          )}
          
          <Button
            onClick={() => synthesizeClass.mutate()}
            disabled={synthesizeClass.isPending || analyzedCount === 0}
            className="analysis-button flex items-center gap-2"
          >
            {synthesizeClass.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Synthesize Class Strategy
          </Button>
        </div>
      </div>

      {/* Add Student Form */}
      {isAddingStudent && (
        <div className="academic-card p-6 slide-in">
          <h3 className="font-semibold mb-4">Add New Student</h3>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <Input
                placeholder="Enter numeric student ID..."
                value={newStudentId}
                onChange={(e) => handleStudentIdChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !idError && handleAddStudent()}
                className={idError ? "border-destructive" : ""}
                autoFocus
              />
              {idError && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {idError}
                </p>
              )}
            </div>
            <Button onClick={handleAddStudent} disabled={addStudent.isPending || !!idError}>
              {addStudent.isPending ? "Adding..." : "Add"}
            </Button>
            <Button variant="outline" onClick={() => { setIsAddingStudent(false); setIdError(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Class Summary */}
      {classData?.class_summary && (
        <div className="insight-section slide-in">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">
              Class Strategy Summary
            </h3>
          </div>
          <div className="max-w-none">
            {renderMarkdown(classData.class_summary)}
          </div>
        </div>
      )}

      {/* Students Table */}
      {isLoading ? (
        <div className="academic-card p-8">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading students...</span>
          </div>
        </div>
      ) : students && students.length > 0 ? (
        <div className="academic-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/50">
                <th className="w-24">Student ID</th>
                <th>Personality Tag</th>
                <th className="w-32">Analysis Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => onStudentClick(student.id, student.student_numeric_id)}
                  className="cursor-pointer"
                >
                  <td>
                    <span className="numeric-badge">{student.student_numeric_id}</span>
                  </td>
                  <td>
                    {student.ai_personality_tag ? (
                      <span className="personality-tag">{student.ai_personality_tag}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Not analyzed</span>
                    )}
                  </td>
                  <td>
                    {student.ai_full_portrait ? (
                      <span className="text-success text-sm font-medium">Complete</span>
                    ) : student.raw_notes ? (
                      <span className="text-warning text-sm font-medium">Notes saved</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="academic-card p-12 text-center">
          <p className="text-muted-foreground">No students in this class yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Add a student to get started.</p>
        </div>
      )}

      {/* Delete Class */}
      <div className="pt-8 border-t border-border">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Class
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{className}" permanently?</AlertDialogTitle>
              <AlertDialogDescription className="text-destructive font-medium">
                ⚠️ WARNING: This is a destructive action that cannot be undone.
              </AlertDialogDescription>
              <AlertDialogDescription>
                This will permanently delete this class and ALL {students?.length || 0} students 
                inside it, including their observation notes and AI-generated insights.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteClass.mutate()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteClass.isPending ? "Deleting..." : "Delete Class & All Students"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ClassView;
