import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, ShieldCheck, Users, Sparkles, Trophy, GraduationCap, Quote, Megaphone, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-campus.jpg";
import principalImg from "@/assets/principal.jpg";
import classroomImg from "@/assets/classroom.jpg";
import labImg from "@/assets/lab.jpg";
import libraryImg from "@/assets/library.jpg";
import sportsImg from "@/assets/sports.jpg";
import { SectionHeading } from "@/components/site/Section";
import { useSiteContent } from "@/hooks/use-site-content";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import { ScrollReveal } from "@/components/site/ScrollReveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Aiman's School Umerkot | Premier English-Medium School & College" },
      { name: "description", content: "Welcome to The Aiman's School Umerkot — academic excellence from Montessori to Intermediate with smart classes, Islamic values and experienced faculty." },
      { property: "og:title", content: "The Aiman's School Umerkot" },
      { property: "og:description", content: "Premier English-medium school & college in Umerkot." },
      { property: "og:image", content: heroImg },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const features = [
  { icon: BookOpen, title: "Smart Classrooms", desc: "Interactive digital learning across every level." },
  { icon: ShieldCheck, title: "Safe Campus", desc: "24/7 CCTV monitoring and trained staff." },
  { icon: Users, title: "Experienced Faculty", desc: "Dedicated teachers committed to student growth." },
  { icon: Sparkles, title: "Islamic Values", desc: "Character building rooted in tradition." },
  { icon: Trophy, title: "Co-curricular", desc: "Sports, debates, art and annual functions." },
  { icon: GraduationCap, title: "College Section", desc: "Pre-Medical, Pre-Engineering & Commerce." },
];

function Home() {
  const c = useSiteContent("home");
  const [notices, setNotices] = useState<{ id: string; title: string; body: string | null; important: boolean; published_at: string }[]>([]);

  useEffect(() => {
    supabase
      .from("notices")
      .select("id,title,body,important,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(4)
      .then(({ data }) => setNotices(data ?? []));
  }, []);

  const heroImage = c.get("hero", "image_url") || heroImg;
  const principalPhoto = c.get("principal", "photo") || principalImg;
  const cardPrincipal = c.get("cards", "principal") || principalImg;
  const cardClassroom = c.get("cards", "classroom") || classroomImg;
  const cardLab = c.get("cards", "lab") || labImg;
  const cardLibrary = c.get("cards", "library") || libraryImg;
  const cardSports = c.get("cards", "sports") || sportsImg;
  const stats = [
    { value: c.get("stats", "students", "1,200+"), label: "Students Enrolled" },
    { value: c.get("stats", "teachers", "60+"), label: "Qualified Teachers" },
    { value: c.get("stats", "results", "98%"), label: "Result Success Rate" },
    { value: c.get("stats", "years", "15+"), label: "Years of Excellence" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="The Aiman's School campus" 
            className="w-full h-full object-cover" 
            width={1920} 
            height={1080} 
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/90 via-[#0B1F3A]/75 to-[#0B1F3A]/30" />
        </div>
        <div className="relative container-prose py-24 text-white">
          <div className="max-w-3xl animate-fade-up">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05]">
              {c.get("hero", "title", "Shaping Tomorrow's Leaders Today")}
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/90 leading-relaxed max-w-2xl">
              {c.get("hero", "subtitle", "The Aiman's School Umerkot blends modern academics, Islamic values and a nurturing environment to prepare students for excellence — from Montessori to Intermediate.")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/admissions" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white text-[oklch(0.22_0.06_258)] font-semibold shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:bg-white/95 hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] hover:scale-[1.02] transition-all duration-300">
                {c.get("hero", "cta_primary", "Apply for Admission")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white/10 border-2 border-white text-white font-semibold shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:bg-white hover:text-[oklch(0.22_0.06_258)] hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.7)] hover:scale-[1.02] transition-all duration-300">
                {c.get("hero", "cta_secondary", "Discover Our School")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative mt-8 md:mt-12 z-10">
        <div className="container-prose">
          <ScrollReveal animation="fade-up" duration={800} delay={100}>
            <div className="glass rounded-2xl shadow-elegant grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
              {stats.map((s) => (
                <div key={s.label} className="p-6 md:p-8 text-center">
                  <div className="font-display text-3xl md:text-4xl font-bold text-primary">
                    <AnimatedCounter value={s.value} />
                  </div>
                  <div className="mt-1 text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* LATEST NOTICES */}
      {notices.length > 0 && (
        <section className="pt-20 pb-4 content-lazy-render">
          <div className="container-prose">
            <ScrollReveal animation="fade-up" duration={900}>
              <SectionHeading
                eyebrow="Latest Notices"
                title={<>School <span className="gold-underline">Announcements</span></>}
                description="Important updates and announcements for students and parents."
              />
              <div className="grid sm:grid-cols-2 gap-4">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className={`group relative rounded-2xl border bg-card p-6 hover:shadow-elegant transition-all overflow-hidden ${n.important ? "border-destructive/40" : ""}`}
                  >
                    {n.important && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">
                        Important
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`h-11 w-11 rounded-xl grid place-items-center flex-shrink-0 ${n.important ? "bg-destructive/10 text-destructive" : "bg-gold/15 text-primary"}`}>
                        {n.important ? <AlertCircle className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">
                          {new Date(n.published_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                        <h3 className="font-semibold text-primary leading-snug">{n.title}</h3>
                        {n.body && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.body}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* WHY US */}
      <section className="py-24 content-lazy-render">
        <div className="container-prose">
          <ScrollReveal animation="fade-up" duration={900}>
            <SectionHeading
              center
              eyebrow="Why Choose Us"
              title={<>An Environment Where <span className="gold-underline">Students Flourish</span></>}
              description="From foundational years to college preparation, every detail of our campus is designed for academic, moral and personal growth."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} className="group rounded-2xl border bg-card p-8 hover:shadow-elegant hover:-translate-y-1 transition-all">
                  <div className="h-12 w-12 rounded-xl bg-primary/5 text-primary grid place-items-center group-hover:bg-gold group-hover:text-gold-foreground transition-colors">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-primary">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* PRINCIPAL MESSAGE */}
      <section className="py-24 bg-secondary content-lazy-render">
        <div className="container-prose grid lg:grid-cols-2 gap-12 items-center overflow-hidden">
          <ScrollReveal animation="slide-left" duration={900} className="w-full">
            <div className="relative">
              <div className="absolute -inset-4 bg-gold/20 rounded-3xl -rotate-2" />
              <img src={principalPhoto} alt="Principal of The Aiman's School" className="relative rounded-3xl shadow-elegant w-full object-cover" width={1024} height={1280} loading="lazy" />
            </div>
          </ScrollReveal>
          <ScrollReveal animation="slide-right" duration={900} className="w-full">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-3">A Message from the Principal</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">{c.get("welcome", "title", "Education is the most powerful gift we can offer the next generation.")}</h2>
              <Quote className="h-8 w-8 text-gold mt-6" />
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {c.get("welcome", "body", "At The Aiman's School Umerkot, we believe each child carries a unique spark.")}
              </p>
              <div className="mt-6">
                <div className="font-semibold text-primary">Principal</div>
                <div className="text-sm text-muted-foreground">The Aiman's School Umerkot</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CAMPUS GALLERY TEASE */}
      <section className="py-24 content-lazy-render">
        <div className="container-prose">
          <ScrollReveal animation="fade-up" duration={950}>
            <SectionHeading
              eyebrow="Our Campus"
              title={<>A Place Built for <span className="gold-underline">Learning</span></>}
              description="Smart classrooms, science and computer labs, a well-stocked library and dedicated sports facilities."
            />
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { src: cardClassroom, label: "Smart Classrooms" },
                { src: cardLab, label: "Computer & Science Labs" },
                { src: cardLibrary, label: "Library" },
                { src: cardSports, label: "Sports Ground" },
                { src: heroImage, label: "Main Campus" },
                { src: cardPrincipal, label: "Leadership" },
              ].slice(0, 6).map((g, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl aspect-[4/3]">
                  <img src={g.src} alt={g.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/90 to-transparent opacity-90" />
                  <div className="absolute bottom-4 left-4 right-4 text-white font-semibold">{g.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/gallery" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-gold">
                View Full Gallery <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ADMISSIONS CTA */}
      <section className="py-20 content-lazy-render">
        <div className="container-prose">
          <ScrollReveal animation="scale-in" duration={850}>
            <div className="relative overflow-hidden rounded-3xl bg-[#152A4A] border border-white/10 text-white p-10 md:p-16 shadow-elegant">
              <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-sky/20 blur-3xl" />
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80 mb-3">Admissions Open</div>
                  <h3 className="font-display text-3xl md:text-4xl font-bold">Join a community that believes in your child's future.</h3>
                  <p className="mt-4 text-white/80">Applications for the new academic session are now open. Reserve your child's seat today.</p>
                </div>
                <div className="flex md:justify-end gap-3 flex-wrap">
                  <Link to="/admissions" className="px-6 py-3 rounded-md bg-white text-[oklch(0.22_0.06_258)] font-semibold shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:bg-white/95 hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] hover:scale-[1.02] transition-all duration-300">Start Application</Link>
                  <Link to="/contact" className="px-6 py-3 rounded-md bg-white/10 border-2 border-white text-white font-semibold shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:bg-white hover:text-[oklch(0.22_0.06_258)] hover:shadow-[0_0_25px_rgba(255,255,255,0.7)] hover:scale-[1.02] transition-all duration-300">Talk to Us</Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-secondary content-lazy-render">
        <div className="container-prose">
          <ScrollReveal animation="fade-up" duration={900}>
            <SectionHeading center eyebrow="Parents Speak" title="Trusted by Families Across Umerkot" />
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { q: "The teachers genuinely care about every child. My daughter's confidence has grown beyond measure.", n: "Aisha R.", r: "Parent, Grade 5" },
                { q: "A perfect balance of modern education and Islamic values. Highly recommended for any family in Umerkot.", n: "Imran K.", r: "Parent, Grade 8" },
                { q: "Smart classrooms and excellent results. Best decision we made for our son's future.", n: "Sana M.", r: "Parent, Grade 10" },
              ].map((t, i) => (
                <div key={i} className="rounded-2xl bg-card border p-8 hover:shadow-elegant transition">
                  <Quote className="h-6 w-6 text-gold" />
                  <p className="mt-4 text-foreground leading-relaxed">"{t.q}"</p>
                  <div className="mt-6 pt-6 border-t">
                    <div className="font-semibold text-primary">{t.n}</div>
                    <div className="text-xs text-muted-foreground">{t.r}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
