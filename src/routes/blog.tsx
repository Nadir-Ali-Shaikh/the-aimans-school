import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Section";
import { Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-campus.jpg";
import { useSiteContent } from "@/hooks/use-site-content";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "News & Blog | The Aiman's School Umerkot" },
      { name: "description", content: "Latest news, announcements, results and events from The Aiman's School Umerkot." },
      { property: "og:title", content: "News & Blog — The Aiman's School Umerkot" },
      { property: "og:description", content: "Announcements, events and stories from our campus." },
      { property: "og:image", content: heroImg },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: Blog,
});

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  image_url: string | null;
  published_at: string;
};

function Blog() {
  const c = useSiteContent("blog");
  const heroImage = c.get("hero", "image_url") || heroImg;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blogs")
      .select("id, slug, title, excerpt, category, image_url, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data ?? []) as Post[]);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageHero
        eyebrow={c.get("hero", "eyebrow", "News & Blog")}
        title={c.get("hero", "title", "Stories from our campus.")}
        description={c.get("hero", "description", "Announcements, results, events and updates from the heart of The Aiman's School Umerkot.")}
        image={heroImage}
      />
      <section className="py-20">
        <div className="container-prose">
          {loading ? (
            <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">{c.get("empty", "message", "No news posts yet. Check back soon.")}</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group rounded-2xl overflow-hidden bg-card border hover:shadow-elegant hover:-translate-y-1 transition-all"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-secondary">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                  </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-white/60">
                        {p.category && <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-semibold tracking-wide uppercase">{p.category}</span>}
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(p.published_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="mt-3 font-display text-xl font-semibold text-white leading-snug group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] transition-all duration-300">{p.title}</h3>
                    {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
