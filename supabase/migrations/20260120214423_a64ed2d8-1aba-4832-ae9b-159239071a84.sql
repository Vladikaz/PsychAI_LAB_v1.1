-- Create the classes table
CREATE TABLE public.classes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    class_name TEXT NOT NULL,
    class_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the students table with numeric ID constraint
CREATE TABLE public.students (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_numeric_id INTEGER NOT NULL,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    raw_notes TEXT,
    ai_personality_tag TEXT,
    ai_full_portrait TEXT,
    ai_dos_donts TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(class_id, student_numeric_id)
);

-- Enable Row Level Security
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create public access policies (no auth required for this pedagogical tool)
CREATE POLICY "Allow public read access on classes" 
ON public.classes FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access on classes" 
ON public.classes FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access on classes" 
ON public.classes FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access on classes" 
ON public.classes FOR DELETE 
USING (true);

CREATE POLICY "Allow public read access on students" 
ON public.students FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access on students" 
ON public.students FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access on students" 
ON public.students FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access on students" 
ON public.students FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();