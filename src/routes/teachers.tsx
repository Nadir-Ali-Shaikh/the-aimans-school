import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, User, BookOpen, Quote, Mail, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import classroomImg from "@/assets/classroom.jpg";
import principalImg from "@/assets/principal.jpg";

export const Route = createFileRoute("/teachers")({
  head: () => ({
    meta: [
      { title: "Our Faculty | The Aiman's School Umerkot" },
      { name: "description", content: "Meet the experienced, highly qualified teachers and leadership at The Aiman's School Umerkot — dedicated to academic excellence." },
      { property: "og:title", content: "Our Faculty — The Aiman's School Umerkot" },
      { property: "og:description", content: "Experienced educators shaping tomorrow's leaders." },
      { property: "og:image", content: classroomImg },
      { property: "og:url", content: "/teachers" },
    ],
    links: [{ rel: "canonical", href: "/teachers" }],
  }),
  component: TeachersPublic,
});

type Teacher = {
  id: string;
  name: string;
  title: string | null;
  subject: string | null;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
};

const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: "default-1",
    name: "Dr. Muhammad Aiman",
    title: "Principal & Founder",
    subject: "Education Leadership",
    bio: "Dr. Aiman has over 20 years of experience in leading educational institutions. He holds a Ph.D. in Education Management and is passionate about building a learning ecosystem that merges modern academic tools with moral values.",
    photo_url: principalImg,
    sort_order: 1,
  },
  {
    id: "default-2",
    name: "Mrs. Aisha Rehman",
    title: "Vice Principal",
    subject: "English Language & Literature",
    bio: "Mrs. Aisha holds an M.A. in English Literature. She is dedicated to training students in communicative English and soft skills, helping them express themselves with high confidence.",
    photo_url: null,
    sort_order: 2,
  },
  {
    id: "default-3",
    name: "Mr. Imran Khan",
    title: "Head of Science Department",
    subject: "Physics",
    bio: "Mr. Imran has taught physics for 12 years. He uses smart classroom tools and experimental lab demonstrations to make complex scientific concepts intuitive and exciting.",
    photo_url: null,
    sort_order: 3,
  },
  {
    id: "default-4",
    name: "Ms. Sana Malik",
    title: "Senior Instructor",
    subject: "Computer Science",
    bio: "Ms. Sana holds a Master's degree in Computer Science. She guides students through programming, smart tech usage, and prepares them for the future digital economy.",
    photo_url: null,
    sort_order: 4,
  },
  {
    id: "default-5",
    name: "Mr. Ahmed Shah",
    title: "Mathematics Faculty",
    subject: "Mathematics",
    bio: "Mr. Ahmed holds an M.Sc. in Mathematics. He designs conceptual worksheets and mental math challenges that build strong analytical thinking and quantitative skills.",
    photo_url: null,
    sort_order: 5,
  },
  {
    id: "default-6",
    name: "Ms. Fatima Ali",
    title: "Montessori Directress",
    subject: "Early Childhood Development",
    bio: "Ms. Fatima is a certified Montessori practitioner. She creates a warm, sensory-rich playing-to-learn environment that builds curiosity and fine motor skills.",
    photo_url: null,
    sort_order: 6,
  },
];

function TeachersPublic() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data, error } = await supabase
          .from("teachers")
          .select("*")
          .order("sort_order")
          .order("name");

        if (error) throw error;

        if (data && data.length > 0) {
          setTeachers(data as Teacher[]);
        } else {
          setTeachers(DEFAULT_TEACHERS);
        }
      } catch (err) {
        console.error("Failed to load teachers from Supabase, utilizing premium defaults:", err);
        setTeachers(DEFAULT_TEACHERS);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Split leadership (Principal/Founder) from standard teaching faculty
  const leadership = teachers.filter((t) => {
    const title = t.title?.toLowerCase() || "";
    const isLead = title.includes("principal") || title.includes("founder") || title.includes("headmaster");
    const isAuxiliary = title.includes("vice") || title.includes("assistant") || title.includes("jr") || title.includes("junior");
    return isLead && !isAuxiliary;
  });

  const faculty = teachers.filter((t) => 
    !leadership.some((lead) => lead.id === t.id)
  );

  return (
    <>
      <PageHero
        eyebrow="Our Faculty"
        title="Meet Our Distinguished Educators"
        description="A team of passionate, highly qualified teachers and visionary leaders dedicated to academic excellence, moral grounding, and character building."
        image={classroomImg}
      />

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground text-sm">Loading faculty profiles...</p>
        </div>
      ) : (
        <>
          {/* LEADERSHIP SECTION */}
          {leadership.length > 0 && (
            <section className="py-24 bg-secondary/30 overflow-hidden">
              <div className="container-prose">
                <SectionHeading
                  center
                  eyebrow="School Leadership"
                  title={<>Visionary <span className="gold-underline">Guidance</span></>}
                  description="Leading our school with high standards of academic distinction and deep-rooted ethical values."
                />
                
                <div className="space-y-12">
                  {leadership.map((l, i) => (
                    <div 
                      key={l.id} 
                      className="glass rounded-3xl p-8 md:p-12 border shadow-elegant grid md:grid-cols-[300px_1fr] gap-10 items-center max-w-5xl mx-auto"
                    >
                      <ScrollReveal 
                        animation={i % 2 === 0 ? "slide-left" : "slide-right"} 
                        duration={900}
                        className="w-full flex justify-center"
                      >
                        <div className="relative group">
                          <div className="absolute -inset-2 bg-gold rounded-2xl rotate-3 opacity-30 group-hover:rotate-1 transition-transform duration-500" />
                          <div className="relative h-72 w-56 rounded-2xl overflow-hidden shadow-md">
                            {l.photo_url ? (
                              <img 
                                src={l.photo_url} 
                                alt={l.name} 
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full bg-primary/10 flex flex-col items-center justify-center text-primary/30">
                                <User className="h-16 w-16" />
                              </div>
                            )}
                          </div>
                        </div>
                      </ScrollReveal>
                      
                      <ScrollReveal 
                        animation={i % 2 === 0 ? "slide-right" : "slide-left"} 
                        duration={900}
                        className="w-full"
                      >
                        <div className="text-left">
                          <Quote className="h-10 w-10 text-gold mb-4 opacity-50" />
                          <h3 className="font-display text-2xl md:text-3xl font-bold text-primary">{l.name}</h3>
                          <div className="text-sm font-semibold text-gold uppercase tracking-wider mt-1">
                            {l.title} {l.subject && `• ${l.subject}`}
                          </div>
                          <p className="mt-4 text-muted-foreground leading-relaxed italic text-base md:text-lg">
                            "{l.bio || "Leading the generation towards a luminous future of education and character development."}"
                          </p>
                          <div className="mt-6 flex gap-4 text-xs font-semibold text-primary uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Award className="h-4 w-4 text-gold" /> Experienced Leadership</span>
                            <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4 text-gold" /> Distinguished Academician</span>
                          </div>
                        </div>
                      </ScrollReveal>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* FACULTY SECTION */}
          {faculty.length > 0 && (
            <section className="py-24 content-lazy-render">
              <div className="container-prose">
                <SectionHeading
                  center
                  eyebrow="Our Educators"
                  title={<>Our Experienced <span className="gold-underline">Teachers</span></>}
                  description="Meet our highly qualified subject specialists who guide, nurture, and prepare students for outstanding accomplishments."
                />

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {faculty.map((f, i) => (
                    <ScrollReveal 
                      key={f.id} 
                      animation="fade-up" 
                      duration={800} 
                      delay={(i % 3) * 100}
                    >
                      <div className="group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-elegant hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                        <div className="aspect-[4/3] w-full rounded-xl overflow-hidden relative bg-secondary mb-5">
                          {f.photo_url ? (
                            <img 
                              src={f.photo_url} 
                              alt={f.name} 
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full bg-primary/5 flex items-center justify-center text-primary/20">
                              <User className="h-16 w-16" />
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1 shadow-sm">
                            <BookOpen className="h-3 w-3 text-gold" />
                            {f.subject || "General Faculty"}
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-primary group-hover:text-gold transition-colors duration-300">
                          {f.name}
                        </h3>
                        <div className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">
                          {f.title || "Subject Teacher"}
                        </div>
                        
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1 border-t pt-3 line-clamp-3">
                          {f.bio || "Dedicated educator focused on dynamic classroom interaction and robust character building."}
                        </p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CONTACT JOIN US CTA */}
          <section className="py-20 bg-[#152A4A] border-t border-b border-white/10 text-white content-lazy-render">
            <div className="container-prose text-center">
              <ScrollReveal animation="scale-in" duration={850}>
                <div className="max-w-2xl mx-auto">
                  <GraduationCap className="h-12 w-12 text-white/80 mx-auto mb-4" />
                  <h3 className="font-display text-3xl font-bold">Have Questions for Our Faculty?</h3>
                  <p className="mt-4 text-white/80 text-sm md:text-base leading-relaxed">
                    Our team of counselors and teachers are always happy to discuss your child's academic pathways, custom requirements, and our teaching methodologies.
                  </p>
                  <div className="mt-8 flex justify-center gap-4">
                    <a href="/contact" className="px-6 py-3 rounded-lg bg-gold text-gold-foreground font-semibold shadow-gold hover:brightness-105 transition">
                      Get In Touch
                    </a>
                    <a href="/admissions" className="px-6 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm font-medium">
                      Admission Info
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </>
      )}
    </>
  );
}
