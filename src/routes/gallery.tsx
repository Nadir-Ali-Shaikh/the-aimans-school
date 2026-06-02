import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Section";
import heroImg from "@/assets/hero-campus.jpg";
import { useEffect, useState } from "react";
import { useSiteContent } from "@/hooks/use-site-content";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const searchSchema = z.object({
  category: z.string().optional(),
});

export const Route = createFileRoute("/gallery")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Gallery | The Aiman's School Umerkot" },
      { name: "description", content: "Take a visual tour of our campus — classrooms, events, sports, annual functions and student activities." },
      { property: "og:title", content: "Gallery — The Aiman's School Umerkot" },
      { property: "og:description", content: "Photos and videos from campus life." },
      { property: "og:image", content: heroImg },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: Gallery,
});

type Item = { id: string; title: string | null; image_url: string; category: string | null; sort_order: number };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Gallery() {
  const { category } = Route.useSearch();
  const [active, setActive] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const c = useSiteContent("gallery");
  const heroImage = c.get("hero", "image_url") || heroImg;

  useEffect(() => {
    supabase
      .from("gallery_items")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data ?? []) as Item[]);
        setLoading(false);
      });
  }, []);

  // Scroll to the requested category once items load
  useEffect(() => {
    if (!category || loading) return;
    const id = `cat-${slugify(category)}`;
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [category, loading]);

  // Group items by category
  const visible = category ? items.filter((i) => (i.category ?? "Uncategorized") === category) : items;
  const grouped = new Map<string, Item[]>();
  visible.forEach((it) => {
    const k = it.category ?? "Uncategorized";
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(it);
  });
  const sections = Array.from(grouped.entries());

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title={category ? category : "A glimpse into life at our school."}
        description={category ? `Photos and videos from ${category}.` : "Smiling faces, focused minds and proud moments — captured across our campus."}
        image={heroImage}
      />

      {category && (
        <div className="container-prose pt-6">
          <Link to="/gallery" search={{}} className="text-sm text-primary hover:underline">← View all categories</Link>
        </div>
      )}

      <section className="py-12">
        <div className="container-prose space-y-16">
          {loading && <div className="text-center text-muted-foreground py-12">Loading…</div>}
          {!loading && sections.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              {category ? `No images for "${category}" yet.` : "No images in the gallery yet."}
            </div>
          )}
          {sections.map(([cat, list]) => (
            <div key={cat} id={`cat-${slugify(cat)}`} className="scroll-mt-24">
              <div className="mb-6">
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-2">Section</div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary">{cat}</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p.image_url)}
                    className="group relative overflow-hidden rounded-2xl aspect-[4/3] text-left"
                  >
                    <img src={p.image_url} alt={p.title ?? cat} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 via-[#0B1F3A]/20 to-transparent" />
                    {p.title && <div className="absolute bottom-4 left-4 right-4 text-white font-semibold">{p.title}</div>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {active && (
        <div
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 bg-[#0B1F3A]/90 backdrop-blur grid place-items-center p-6 cursor-zoom-out"
        >
          <img src={active} alt="" className="max-h-[88vh] max-w-full rounded-xl shadow-elegant" />
        </div>
      )}
    </>
  );
}
