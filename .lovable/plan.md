## Goal
Admin ko poori website ka **text + images** edit karne ki ability dena (Home, About, Academics, Facilities, Contact, Footer/Brand) — Blogs/Notices/Teachers/Gallery already editable hain.

## Approach: Generic Site Content CMS

### 1. Database — naya table `site_content`
Single key-value table jo har page ke har editable field ko store karega:
- `page` (text) — e.g. `home`, `about`, `academics`, `facilities`, `contact`, `global`
- `section` (text) — e.g. `hero`, `mission`, `principal`, `cta`
- `field_key` (text) — e.g. `title`, `subtitle`, `image_url`, `paragraph_1`
- `label` (text) — admin-friendly label ("Hero Title")
- `field_type` (text) — `text` | `textarea` | `image` | `url`
- `value` (text)
- `sort_order` (int)
- UNIQUE(page, section, field_key)
- RLS: public read, admin write

Seed migration tamam current hard-coded content (titles, paragraphs, image URLs) is table mein daal degi.

### 2. Admin UI — `/admin/content`
- Sidebar mein "Site Content" link add
- Page selector (Home / About / Academics / Facilities / Contact / Global)
- Sections grouped, har field apni type ke hisab se render:
  - `text` → input
  - `textarea` → multi-line
  - `image` → ImageUpload (Supabase storage upload, URL save)
  - `url` → input
- "Save" button → bulk update

### 3. Public pages refactor
- Naya hook `useSiteContent(page)` → fetches all rows for that page, returns helper `get(section, key, fallback)`
- Har public route (`index`, `about`, `academics`, `facilities`, `contact`) ko refactor karke hard-coded strings/images ki jaga `c.get('hero','title','Default')` use kare
- Fallback defaults rakhenge taake DB empty ho to bhi page tutey nahi
- Footer/Brand global content

### 4. Out of scope (already editable)
Blogs, Notices, Teachers, Gallery, Admissions inbox, Inquiries inbox — yeh existing admin pages se manage hote hain.

## Files to be created/edited
- **New migration**: `site_content` table + seed
- **New**: `src/routes/admin.content.tsx`
- **New**: `src/hooks/use-site-content.ts`
- **Edit**: `src/components/admin/AdminLayout.tsx` (add nav link)
- **Edit**: `src/routes/index.tsx`, `about.tsx`, `academics.tsx`, `facilities.tsx`, `contact.tsx`, `src/components/site/Footer.tsx` (wire to hook with fallbacks)

## Note
Yeh kaam ~10-12 file changes lega. Migration approve karne ke baad sab implement kar dunga ek hi step mein.