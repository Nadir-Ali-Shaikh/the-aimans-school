CREATE TABLE public.student_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_level INT NOT NULL CHECK (class_level BETWEEN 1 AND 12),
  seat_number TEXT NOT NULL,
  student_name TEXT NOT NULL,
  father_name TEXT,
  exam_name TEXT NOT NULL DEFAULT 'Annual Exam',
  session TEXT,
  total_marks INT NOT NULL DEFAULT 0,
  obtained_marks INT NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2),
  grade TEXT,
  status TEXT NOT NULL DEFAULT 'pass',
  remarks TEXT,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_level, seat_number)
);

GRANT SELECT ON public.student_results TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_results TO authenticated;
GRANT ALL ON public.student_results TO service_role;

ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads results"
  ON public.student_results FOR SELECT
  USING (true);

CREATE POLICY "Admins write results"
  ON public.student_results FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_student_results_updated_at
  BEFORE UPDATE ON public.student_results
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_student_results_class_seat ON public.student_results (class_level, seat_number);