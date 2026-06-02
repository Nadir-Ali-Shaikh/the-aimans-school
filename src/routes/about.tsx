import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, Heart, Award } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/Section";
import heroImg from "@/assets/hero-campus.jpg";
import principalImg from "@/assets/principal.jpg";
import { useSiteContent } from "@/hooks/use-site-content";
import { ScrollReveal } from "@/components/site/ScrollReveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | The Aiman's School Umerkot" },
      { name: "description", content: "Learn about The Aiman's School Umerkot — our history, mission, vision and the leadership shaping a generation of confident, ethical learners." },
      { property: "og:title", content: "About The Aiman's School Umerkot" },
      { property: "og:description", content: "Our story, mission, vision and leadership." },
      { property: "og:image", content: heroImg },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  const c = useSiteContent("about");
  const principalPhoto = c.get("principal", "photo") || principalImg;
  const heroImage = c.get("hero", "image_url") || heroImg;
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={c.get("hero", "title", "A legacy of education in Umerkot.")}
        description={c.get("hero", "subtitle", "From humble beginnings to one of the region's most trusted institutions, our story is one of dedication, growth and unwavering belief in young minds.")}
        image={heroImage}
      />

      <section className="py-20 bg-secondary content-lazy-render">
        <div className="container-prose">
          <ScrollReveal animation="fade-up" duration={900}>
            <SectionHeading center eyebrow="What We Stand For" title="Mission, Vision & Values" />
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Target, title: c.get("mission", "title", "Our Mission"), body: c.get("mission", "body", "To deliver excellent academic education combined with strong moral character and Islamic values.") },
                { icon: Eye, title: c.get("vision", "title", "Our Vision"), body: c.get("vision", "body", "To be the leading institution in Umerkot producing confident, ethical and globally-minded leaders.") },
                { icon: Heart, title: "Our Values", body: "Integrity, excellence, respect, compassion and lifelong curiosity guide everything we do." },
              ].map((v) => (
                <div key={v.title} className="rounded-2xl bg-card border p-8 hover:shadow-elegant transition-all hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-xl bg-gold text-gold-foreground grid place-items-center">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-primary">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 content-lazy-render">
        <div className="container-prose grid lg:grid-cols-2 gap-12 items-center overflow-hidden">
          <ScrollReveal animation="slide-left" duration={900} className="w-full">
            <img src={principalPhoto} alt="Principal" className="rounded-3xl shadow-elegant w-full" width={1024} height={1280} loading="lazy" />
          </ScrollReveal>
          <ScrollReveal animation="slide-right" duration={900} className="w-full">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-3">Principal's Message</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">{c.get("principal", "name", "Dr. Muhammad Aiman")}</h2>
              <div className="mt-2 text-sm text-muted-foreground">{c.get("principal", "title", "Founder & Principal")}</div>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>{c.get("principal", "message", "Education is the most powerful weapon to change the world. At The Aiman's School, we are committed to nurturing every child's potential.")}</p>
              </div>
              <div className="mt-8 flex items-start gap-3 text-sm">
                <Award className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Consistently top results in board exams, recognized college section, active parent and alumni community.</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
