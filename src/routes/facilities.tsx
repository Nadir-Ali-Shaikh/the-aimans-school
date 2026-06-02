import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Section";
import {
  Monitor, FlaskConical, BookOpen, Languages, Moon, ShieldCheck, Users, Trophy, Bus,
} from "lucide-react";
import labImg from "@/assets/lab.jpg";
import { useSiteContent } from "@/hooks/use-site-content";
import { ScrollReveal } from "@/components/site/ScrollReveal";

export const Route = createFileRoute("/facilities")({
  head: () => ({
    meta: [
      { title: "Facilities | The Aiman's School Umerkot" },
      { name: "description", content: "Smart classrooms, computer & science labs, library, sports facilities, CCTV security and more — a campus built for modern learning." },
      { property: "og:title", content: "Facilities — The Aiman's School Umerkot" },
      { property: "og:description", content: "Smart classes, labs, library and more." },
      { property: "og:image", content: labImg },
      { property: "og:url", content: "/facilities" },
    ],
    links: [{ rel: "canonical", href: "/facilities" }],
  }),
  component: Facilities,
});

function Facilities() {
  const c = useSiteContent("facilities");
  const facilities = [
    { icon: Monitor, slug: "Smart Classrooms", title: "Smart Classrooms", desc: "Interactive displays and digital content for every class." },
    { icon: FlaskConical, slug: "Science & Computer Labs", title: c.get("labs", "title", "Science & Computer Labs"), desc: c.get("labs", "body", "Hands-on learning with modern equipment and software.") },
    { icon: BookOpen, slug: "Library", title: c.get("library", "title", "Library"), desc: c.get("library", "body", "A growing collection of books, references and reading corners.") },
    { icon: Languages, slug: "English Medium", title: "English Medium", desc: "A confident command of English from the very first year." },
    { icon: Moon, slug: "Islamic Education", title: "Islamic Education", desc: "Qur'an, character building and Islamic values woven into school life." },
    { icon: ShieldCheck, slug: "CCTV Security", title: "CCTV Security", desc: "Round-the-clock monitoring across the entire campus." },
    { icon: Users, slug: "Experienced Teachers", title: "Experienced Teachers", desc: "A dedicated, qualified and continuously trained faculty." },
    { icon: Trophy, slug: "Sports & Activities", title: c.get("sports", "title", "Sports & Activities"), desc: c.get("sports", "body", "Cricket, football, athletics, debates, arts and annual functions.") },
    { icon: Bus, slug: "Transport", title: "Transport (Optional)", desc: "Safe transportation routes covering key areas of Umerkot." },
  ];

  return (
    <>
      <PageHero
        eyebrow="Facilities"
        title={c.get("hero", "title", "A campus built for modern learning.")}
        description={c.get("hero", "subtitle", "Every facility — from smart classrooms to sports grounds — is designed to give our students the tools and space to thrive.")}
        image={c.get("labs", "image") || labImg}
      />
      <section className="py-20 content-lazy-render">
        <div className="container-prose">
          <ScrollReveal animation="fade-up" duration={900}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((f) => (
                <Link
                  key={f.slug}
                  to="/gallery"
                  search={{ category: f.slug }}
                  className="group rounded-2xl border bg-card p-8 hover:shadow-elegant hover:-translate-y-1 transition-all text-left block"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/5 text-primary grid place-items-center group-hover:bg-gold group-hover:text-gold-foreground transition-colors">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-primary">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  <div className="mt-4 text-xs font-semibold text-gold uppercase tracking-wider">View photos →</div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
