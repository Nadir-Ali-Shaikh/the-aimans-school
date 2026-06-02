import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  image_url: string | null;
  published: boolean;
  published_at: string;
};

export const Route = createFileRoute("/blog/$slug")({
  component: PostPage,
  notFoundComponent: () => (
    <div className="container-prose py-32 text-center">
      <h1 className="font-display text-3xl text-primary">Post not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-gold font-semibold">← Back to news</Link>
    </div>
  ),
});

function PostPage() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    supabase
      .from("blogs")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setMissing(true);
        else setPost(data as Post);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div className="container-prose py-32 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (missing || !post) {
    throw notFound();
  }

  const paragraphs = (post.body ?? "").split(/\n\s*\n/).filter(Boolean);

  return (
    <article>
      <section className="relative h-[50vh] min-h-[360px] flex items-end">
        <div className="absolute inset-0 bg-background">
          {post.image_url && (
            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/85 via-[#0B1F3A]/50 to-[#0B1F3A]/10" />
        </div>
        <div className="relative container-prose pb-12 text-white">
          <Link to="/blog" className="inline-flex items-center gap-2 text-white/70 text-sm font-semibold mb-4 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-300">
            <ArrowLeft className="h-4 w-4" /> All News
          </Link>
          <div className="flex items-center gap-3 text-xs">
            {post.category && <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-semibold tracking-wide uppercase">{post.category}</span>}
            <span className="inline-flex items-center gap-1 text-white/80"><Calendar className="h-3 w-3" /> {new Date(post.published_at).toLocaleDateString()}</span>
          </div>
          <h1 className="mt-3 font-display text-3xl md:text-5xl font-bold max-w-3xl leading-tight">{post.title}</h1>
        </div>
      </section>
      <section className="py-16">
        <div className="container-prose max-w-3xl space-y-5 text-foreground leading-relaxed">
          {paragraphs.length > 0
            ? paragraphs.map((p, i) => <p key={i}>{p}</p>)
            : <p className="text-muted-foreground">No content yet.</p>}
        </div>
      </section>
    </article>
  );
}
