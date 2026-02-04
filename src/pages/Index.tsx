import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabaseWithDevice } from "@/lib/supabaseClient";
import { Plus, FolderOpen, BookOpen, ArrowLeft, FlaskConical } from "lucide-react";
import { embedScopeId, getDemoScopeId, stripScopeId } from "@/lib/demoScope";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ClassCard from "@/components/ClassCard";
import ClassView from "@/components/ClassView";
import StudentProfile from "@/components/StudentProfile";

type View = "classes" | "class-detail" | "student-profile";

interface SelectedClass {
  id: string;
  name: string;
}

interface SelectedStudent {
  id: string;
  numericId: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("classes");
  const [selectedClass, setSelectedClass] = useState<SelectedClass | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);
  const [newClassName, setNewClassName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: classes, isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabaseWithDevice
        .from("classes")
        .select("*, students(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // RLS now enforces device isolation at the database level
      return data || [];
    },
  });

  const createClass = useMutation({
    mutationFn: async (name: string) => {
      // Embed demo scope ID into class name for display purposes
      // device_id is now enforced by RLS
      const scopedName = embedScopeId(name);
      const deviceId = getDemoScopeId();
      const { data, error } = await supabaseWithDevice
        .from("classes")
        .insert({ class_name: scopedName, device_id: deviceId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setNewClassName("");
      setIsCreating(false);
      toast.success("Class created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create class: " + error.message);
    },
  });

  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      toast.error("Please enter a class name");
      return;
    }
    createClass.mutate(newClassName.trim());
  };

  const handleClassClick = (id: string, name: string) => {
    // Strip scope ID to show clean name in navigation
    setSelectedClass({ id, name: stripScopeId(name) });
    setView("class-detail");
  };

  const handleStudentClick = (studentId: string, numericId: number) => {
    setSelectedStudent({ id: studentId, numericId });
    setView("student-profile");
  };

  const handleBack = () => {
    if (view === "student-profile") {
      setSelectedStudent(null);
      setView("class-detail");
    } else if (view === "class-detail") {
      setSelectedClass(null);
      setView("classes");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="academic-header">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">PsychInsights AI</h1>
              <p className="text-sm opacity-90">Pedagogical Intelligence Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Breadcrumb */}
      {view !== "classes" && (
        <div className="border-b bg-card">
          <div className="container py-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {view === "class-detail" ? "All Classes" : selectedClass?.name}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container py-8">
        {view === "classes" && (
          <div className="fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold font-serif text-foreground">Your Classes</h2>
                <p className="text-muted-foreground mt-1">
                  Select a class to view students or create a new one
                </p>
              </div>
              
              {!isCreating && (
                <Button
                  onClick={() => setIsCreating(true)}
                  className="analysis-button flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Class
                </Button>
              )}
            </div>

            {isCreating && (
              <div className="academic-card p-6 mb-8 slide-in">
                <h3 className="font-semibold mb-4">Create New Class</h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter class name..."
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateClass()}
                    className="flex-1"
                    autoFocus
                  />
                  <Button onClick={handleCreateClass} disabled={createClass.isPending}>
                    {createClass.isPending ? "Creating..." : "Create"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="academic-card h-32 animate-pulse bg-muted" />
                ))}
              </div>
            ) : classes && classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                  <ClassCard
                    key={cls.id}
                    id={cls.id}
                    name={stripScopeId(cls.class_name)}
                    studentCount={(cls.students as any)?.[0]?.count || 0}
                    hasSummary={!!cls.class_summary}
                    onClick={() => handleClassClick(cls.id, cls.class_name)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No classes yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first class to get started
                </p>
              </div>
            )}

            {/* Linguistic Lab Entry Point */}
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-xl font-semibold font-serif mb-4">Premium Utilities</h3>
              <div
                onClick={() => navigate("/lab")}
                className="cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] max-w-md"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                    <FlaskConical className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Linguistic Lab</h4>
                    <p className="text-white/80 text-sm">
                      AI-powered tools for semantic analysis, etymology mapping, and cognitive load scanning.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "class-detail" && selectedClass && (
          <ClassView
            classId={selectedClass.id}
            className={selectedClass.name}
            onStudentClick={handleStudentClick}
            onDelete={() => {
              setSelectedClass(null);
              setView("classes");
            }}
          />
        )}

        {view === "student-profile" && selectedStudent && selectedClass && (
          <StudentProfile
            studentId={selectedStudent.id}
            numericId={selectedStudent.numericId}
            classId={selectedClass.id}
            className={selectedClass.name}
            onDelete={() => {
              setSelectedStudent(null);
              setView("class-detail");
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
