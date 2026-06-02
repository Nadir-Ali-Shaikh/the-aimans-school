
CREATE TABLE public.gallery_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gallery_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_sections TO authenticated;
GRANT ALL ON public.gallery_sections TO service_role;

ALTER TABLE public.gallery_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads gallery sections"
ON public.gallery_sections FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins write gallery sections"
ON public.gallery_sections FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.gallery_sections (name, sort_order) VALUES
  ('Smart Classrooms', 1),
  ('Science & Computer Labs', 2),
  ('Library', 3),
  ('English Medium', 4),
  ('Islamic Education', 5),
  ('CCTV Security', 6),
  ('Experienced Teachers', 7),
  ('Sports & Activities', 8),
  ('Transport', 9),
  ('Campus', 10),
  ('Events', 11),
  ('Academics', 12)
ON CONFLICT (name) DO NOTHING;
