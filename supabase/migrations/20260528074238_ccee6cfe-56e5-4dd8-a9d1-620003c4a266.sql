
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section text NOT NULL,
  field_key text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  value text,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, section, field_key)
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads site content" ON public.site_content
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins write site content" ON public.site_content
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_content_set_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed default content
INSERT INTO public.site_content (page, section, field_key, label, field_type, value, sort_order) VALUES
-- GLOBAL / Brand
('global','brand','school_name','School Name','text','The Aiman''s School Umerkot',1),
('global','brand','tagline','Tagline','text','Where Excellence Meets Character',2),
('global','brand','logo_url','Logo Image','image','',3),
('global','contact','phone','Phone','text','+92 342 3299800',1),
('global','contact','email','Email','text','info@theaimansschool.edu.pk',2),
('global','contact','address','Address','textarea','Main Campus, Umerkot, Sindh, Pakistan',3),
('global','contact','whatsapp','WhatsApp Number','text','923423299800',4),

-- HOME page
('home','hero','title','Hero Title','text','Shaping Tomorrow''s Leaders Today',1),
('home','hero','subtitle','Hero Subtitle','textarea','A premium international school in Umerkot offering Montessori, Primary, Secondary and College-level education with world-class facilities.',2),
('home','hero','cta_primary','Primary Button Text','text','Apply for Admission',3),
('home','hero','cta_secondary','Secondary Button Text','text','Explore Programs',4),
('home','hero','image_url','Hero Image','image','',5),
('home','welcome','title','Welcome Title','text','Welcome to The Aiman''s School',1),
('home','welcome','body','Welcome Text','textarea','For over a decade, The Aiman''s School Umerkot has set the benchmark for premium education in the region — blending modern pedagogy with strong moral values.',2),
('home','stats','students','Students Count','text','1200+',1),
('home','stats','teachers','Teachers Count','text','60+',2),
('home','stats','years','Years of Excellence','text','15+',3),
('home','stats','results','Result Rate','text','98%',4),

-- ABOUT page
('about','hero','title','Page Title','text','About Our School',1),
('about','hero','subtitle','Subtitle','textarea','A legacy of academic excellence and character building in Umerkot.',2),
('about','mission','title','Mission Title','text','Our Mission',1),
('about','mission','body','Mission Text','textarea','To provide a world-class education that empowers students with knowledge, skills, and values needed to thrive in a global society.',2),
('about','vision','title','Vision Title','text','Our Vision',1),
('about','vision','body','Vision Text','textarea','To be the leading educational institution in Sindh, recognized for academic excellence, innovation, and character development.',2),
('about','principal','name','Principal Name','text','Dr. Muhammad Aiman',1),
('about','principal','title','Principal Title','text','Founder & Principal',2),
('about','principal','message','Principal Message','textarea','Education is the most powerful weapon to change the world. At The Aiman''s School, we are committed to nurturing every child''s potential.',3),
('about','principal','photo','Principal Photo','image','',4),

-- ACADEMICS page
('academics','hero','title','Page Title','text','Academic Programs',1),
('academics','hero','subtitle','Subtitle','textarea','From Montessori to College, we offer comprehensive education at every stage.',2),
('academics','montessori','title','Montessori Title','text','Montessori (Age 3-5)',1),
('academics','montessori','body','Montessori Description','textarea','Play-based learning environment that develops curiosity, independence, and foundational skills.',2),
('academics','primary','title','Primary Title','text','Primary (Grade 1-5)',1),
('academics','primary','body','Primary Description','textarea','Strong academic foundation with focus on literacy, numeracy, science, and creative arts.',2),
('academics','secondary','title','Secondary Title','text','Secondary (Grade 6-10)',1),
('academics','secondary','body','Secondary Description','textarea','Cambridge and Matriculation streams preparing students for board examinations and beyond.',2),
('academics','college','title','College Title','text','College (Grade 11-12)',1),
('academics','college','body','College Description','textarea','Pre-Medical, Pre-Engineering, ICS, and Commerce groups with experienced faculty.',2),

-- FACILITIES page
('facilities','hero','title','Page Title','text','World-Class Facilities',1),
('facilities','hero','subtitle','Subtitle','textarea','State-of-the-art infrastructure designed for holistic learning.',2),
('facilities','library','title','Library Title','text','Modern Library',1),
('facilities','library','body','Library Description','textarea','Over 10,000 books, digital resources, and quiet reading spaces.',2),
('facilities','library','image','Library Image','image','',3),
('facilities','labs','title','Labs Title','text','Science & Computer Labs',1),
('facilities','labs','body','Labs Description','textarea','Fully equipped physics, chemistry, biology and IT labs.',2),
('facilities','labs','image','Labs Image','image','',3),
('facilities','sports','title','Sports Title','text','Sports Complex',1),
('facilities','sports','body','Sports Description','textarea','Cricket ground, football field, indoor games and physical training facilities.',2),
('facilities','sports','image','Sports Image','image','',3),

-- CONTACT page
('contact','hero','title','Page Title','text','Get in Touch',1),
('contact','hero','subtitle','Subtitle','textarea','We''d love to hear from you. Reach out for admissions, inquiries, or visits.',2),
('contact','info','phone','Phone','text','+92 342 3299800',1),
('contact','info','email','Email','text','info@theaimansschool.edu.pk',2),
('contact','info','address','Address','textarea','Main Campus, Umerkot, Sindh, Pakistan',3),
('contact','info','hours','Office Hours','textarea','Mon–Sat: 8:00 AM – 3:00 PM',4),
('contact','map','embed_url','Google Maps Embed URL','url','https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28823!2d69.74!3d25.36!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sUmerkot!5e0!3m2!1sen!2spk!4v1700000000000',1);
