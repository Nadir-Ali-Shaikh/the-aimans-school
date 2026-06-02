import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, SectionHeading } from "@/components/site/Section";
import classroomImg from "@/assets/classroom.jpg";
import montessoriImg from "@/assets/montessori.jpg";
import libraryImg from "@/assets/library.jpg";
import graduationImg from "@/assets/graduation.jpg";
import { useSiteContent } from "@/hooks/use-site-content";
import { ScrollReveal } from "@/components/site/ScrollReveal";

export const Route = createFileRoute("/academics")({
  head: () => ({
    meta: [
      { title: "Academics | The Aiman's School Umerkot" },
      { name: "description", content: "Montessori, Primary, Secondary and College sections at The Aiman's School Umerkot — a complete academic journey under one roof." },
      { property: "og:title", content: "Academics — The Aiman's School Umerkot" },
      { property: "og:description", content: "Montessori to Intermediate, all under one roof." },
      { property: "og:image", content: classroomImg },
      { property: "og:url", content: "/academics" },
    ],
    links: [{ rel: "canonical", href: "/academics" }],
  }),
  component: Academics,
});

function Academics() {
  const c = useSiteContent("academics");
  const heroImage = c.get("hero", "image_url") || classroomImg;
  const sections = [
    {
      name: c.get("montessori", "title", "Montessori"),
      grades: "Playgroup – KG",
      img: c.get("montessori", "image") || montessoriImg,
      body: c.get("montessori", "body", "A nurturing first step into learning."),
      highlights: ["Trained Montessori teachers", "Activity-based learning", "Safe, joyful environment"],
    },
    {
      name: c.get("primary", "title", "Primary"),
      grades: "Class 1 – 5",
      img: c.get("primary", "image") || classroomImg,
      body: c.get("primary", "body", "Strong academic foundation."),
      highlights: ["English-medium curriculum", "Smart classroom integration", "Regular parent feedback"],
    },
    {
      name: c.get("secondary", "title", "Secondary"),
      grades: "Class 6 – 10",
      img: c.get("secondary", "image") || c.get("middle", "image") || libraryImg,
      body: c.get("secondary", "body", "Cambridge and Matriculation streams."),
      highlights: ["Science & Computer labs", "Board exam preparation", "Co-curricular activities"],
    },
    {
      name: c.get("college", "title", "College Section"),
      grades: "Intermediate (XI – XII)",
      img: c.get("college", "image") || graduationImg,
      body: c.get("college", "body", "Pre-Medical, Pre-Engineering, ICS, and Commerce groups."),
      highlights: ["Multiple academic groups", "Entry test guidance", "Career counselling"],
    },
  ];
  return (
    <>
      <PageHero
        eyebrow="Academics"
        title={c.get("hero", "title", "A complete academic journey, under one roof.")}
        description={c.get("hero", "subtitle", "From Montessori to College, we offer comprehensive education at every stage.")}
        image={heroImage}
      />

      <section className="py-20 overflow-hidden">
        <div className="container-prose space-y-16">
          {sections.map((s, i) => (
            <div key={s.name} className={`grid lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <ScrollReveal 
                animation={i % 2 === 0 ? "slide-left" : "slide-right"} 
                duration={900}
                className="w-full"
              >
                <div className="relative">
                  <div className="absolute -inset-3 bg-gold/20 rounded-3xl -rotate-1" />
                  <img src={s.img} alt={s.name} className="relative rounded-3xl shadow-elegant w-full aspect-[4/3] object-cover" width={1600} height={1067} loading="lazy" />
                </div>
              </ScrollReveal>
              <ScrollReveal 
                animation={i % 2 === 0 ? "slide-right" : "slide-left"} 
                duration={900}
                className="w-full"
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{s.grades}</div>
                  <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-primary">{s.name}</h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{s.body}</p>
                  <ul className="mt-5 space-y-2">
                    {s.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {h}
                      </li>
                    ))}
                  </ul>
                  <Link to="/admissions" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                    Apply to {s.name}
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-secondary content-lazy-render">
        <div className="container-prose">
          <ScrollReveal animation="fade-up" duration={900}>
            <SectionHeading center eyebrow="Our Curriculum" title="Built for understanding, not just memorisation" description="A balanced curriculum integrating national board syllabi with smart classroom tools, continuous assessment and value-based learning." />
            <div className="grid md:grid-cols-4 gap-4">
              {["English", "Urdu", "Mathematics", "Science", "Islamic Studies", "Computer", "Social Studies", "Arts & Sports"].map((c) => (
                <div key={c} className="rounded-xl bg-card border p-5 text-center font-medium text-primary hover:shadow-elegant transition-all hover:-translate-y-1">{c}</div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
