
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS hint text;

-- Add hints to existing image rows
UPDATE public.site_content SET hint='1600×900px (16:9), JPG/PNG' WHERE page='home' AND section='hero' AND field_key='image_url';
UPDATE public.site_content SET hint='800×800px (1:1), JPG/PNG' WHERE page='about' AND section='principal' AND field_key='photo';
UPDATE public.site_content SET hint='1200×800px (3:2), JPG/PNG' WHERE page='facilities' AND section IN ('labs','library','sports') AND field_key='image';
UPDATE public.site_content SET hint='256×256px square, PNG with transparent background' WHERE page='global' AND section='brand' AND field_key='logo_url';

-- Seed new image rows
INSERT INTO public.site_content (page, section, field_key, label, field_type, value, sort_order, hint) VALUES
-- About
('about','hero','image_url','Hero Image','image',NULL,99,'1600×900px (16:9), JPG/PNG'),
-- Academics
('academics','hero','image_url','Hero Image','image',NULL,99,'1600×900px (16:9), JPG/PNG'),
('academics','montessori','image','Montessori Image','image',NULL,1,'1200×800px (3:2), JPG/PNG'),
('academics','primary','image','Primary Image','image',NULL,2,'1200×800px (3:2), JPG/PNG'),
('academics','middle','image','Middle Image','image',NULL,3,'1200×800px (3:2), JPG/PNG'),
('academics','secondary','image','Secondary Image','image',NULL,4,'1200×800px (3:2), JPG/PNG'),
-- Admissions
('admissions','hero','image_url','Hero Image','image',NULL,99,'1600×900px (16:9), JPG/PNG'),
-- Contact
('contact','hero','image_url','Hero Image','image',NULL,99,'1600×900px (16:9), JPG/PNG'),
-- Blog
('blog','hero','image_url','Hero Image','image',NULL,99,'1600×900px (16:9), JPG/PNG'),
-- Results
('results','hero','image_url','Hero Image','image',NULL,99,'1600×900px (16:9), JPG/PNG'),
-- Gallery
('gallery','hero','image_url','Hero Image','image',NULL,99,'1600×900px (16:9), JPG/PNG'),
('gallery','video','thumb_1','Video Thumbnail 1','image',NULL,1,'1280×720px (16:9), JPG/PNG'),
('gallery','video','thumb_2','Video Thumbnail 2','image',NULL,2,'1280×720px (16:9), JPG/PNG'),
('gallery','video','thumb_3','Video Thumbnail 3','image',NULL,3,'1280×720px (16:9), JPG/PNG'),
-- Home cards
('home','cards','principal','Principal Card Image','image',NULL,10,'800×800px (1:1), JPG/PNG'),
('home','cards','classroom','Classroom Card Image','image',NULL,11,'1200×800px (3:2), JPG/PNG'),
('home','cards','lab','Computer Lab Card Image','image',NULL,12,'1200×800px (3:2), JPG/PNG'),
('home','cards','library','Library Card Image','image',NULL,13,'1200×800px (3:2), JPG/PNG'),
('home','cards','sports','Sports Card Image','image',NULL,14,'1200×800px (3:2), JPG/PNG')
ON CONFLICT (page, section, field_key) DO UPDATE SET hint = EXCLUDED.hint, label = EXCLUDED.label;
