import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Loader2, Save, Check, Newspaper, FileText, Eye, EyeOff, Calendar, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/admin/blogs")({
  head: () => ({ meta: [{ title: "News & Blog | Admin" }, { name: "robots", content: "noindex" }] }),
  component: BlogsAdmin,
});

type Blog = {
  id: string; slug: string; title: string; excerpt: string | null; body: string | null;
  category: string | null; image_url: string | null; published: boolean; published_at: string;
};

type ContentRow = {
  id: string; page: string; section: string; field_key: string; label: string;
  field_type: "text" | "textarea" | "image" | "url"; value: string | null;
  sort_order: number; hint: string | null;
};

const empty: Partial<Blog> = { slug: "", title: "", excerpt: "", body: "", category: "Announcements", image_url: null, published: true };
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function BlogsAdmin() {
  const [tab, setTab] = useState<"posts" | "page">("posts");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">News & Blog</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage news posts and the public News page content.</p>
      </div>

      <div className="flex gap-1 border-b">
        <TabBtn active={tab === "posts"} onClick={() => setTab("posts")} icon={<Newspaper className="h-4 w-4" />} label="News posts" />
        <TabBtn active={tab === "page"} onClick={() => setTab("page")} icon={<FileText className="h-4 w-4" />} label="Page content" />
      </div>

      {tab === "posts" ? <PostsPanel /> : <PageContentPanel />}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
      {icon} {label}
    </button>
  );
}

/* ---------------- Posts ---------------- */

function PostsPanel() {
  const [items, setItems] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Blog> | null>(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("blogs").select("*").order("published_at", { ascending: false });
    setItems((data ?? []) as Blog[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((b) => {
    if (filter === "published" && !b.published) return false;
    if (filter === "draft" && b.published) return false;
    if (q && !`${b.title} ${b.category ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items, q, filter]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const payload: any = {
      slug: editing.slug || slugify(editing.title || ""),
      title: editing.title, excerpt: editing.excerpt, body: editing.body,
      category: editing.category, image_url: editing.image_url, published: editing.published ?? true,
    };
    const res = editing.id
      ? await supabase.from("blogs").update(payload).eq("id", editing.id)
      : await supabase.from("blogs").insert(payload);
    setSaving(false);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blogs").delete().eq("id", id);
    load();
  };

  const togglePublish = async (b: Blog) => {
    await supabase.from("blogs").update({ published: !b.published }).eq("id", b.id);
    load();
  };

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter((b) => b.published).length,
    draft: items.filter((b) => !b.published).length,
  }), [items]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Published" value={stats.published} tone="success" />
        <StatCard label="Drafts" value={stats.draft} tone="muted" />
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center flex-1 min-w-[200px]">
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts…"
            className="flex-1 max-w-sm rounded-md border bg-background px-3 py-2 text-sm"
          />
          <div className="flex gap-1 rounded-md border bg-card p-1">
            {(["all", "published", "draft"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs rounded capitalize ${filter === f ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{f}</button>
            ))}
          </div>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>

      {loading ? (
        <div className="h-48 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <Newspaper className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">No posts found.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((b) => (
            <div key={b.id} className="group rounded-xl border bg-card hover:shadow-md transition overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-40 aspect-[16/10] sm:aspect-auto bg-secondary shrink-0 overflow-hidden">
                {b.image_url ? <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-muted-foreground"><FileText className="h-6 w-6" /></div>}
              </div>
              <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {b.category && <span className="px-2 py-0.5 rounded-full bg-gold/15 text-xs font-semibold text-gold-foreground">{b.category}</span>}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.published ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                      {b.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(b.published_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-primary truncate">{b.title}</h3>
                  {b.excerpt && <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{b.excerpt}</p>}
                  <p className="text-xs text-muted-foreground mt-1">/blog/{b.slug}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <IconBtn title={b.published ? "Unpublish" : "Publish"} onClick={() => togglePublish(b)}>
                    {b.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </IconBtn>
                  <IconBtn title="Edit" onClick={() => setEditing(b)}><Pencil className="h-4 w-4" /></IconBtn>
                  <IconBtn title="Delete" tone="danger" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4" /></IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl w-full max-w-2xl my-8 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-card rounded-t-2xl">
              <h3 className="font-display text-xl font-bold text-primary">{editing.id ? "Edit post" : "New post"}</h3>
              <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-secondary rounded"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 grid gap-4 overflow-y-auto">
              <Field label="Title"><input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} className="input-field" /></Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Slug"><input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} className="input-field" /></Field>
                <Field label="Category">
                  <select value={editing.category ?? "Announcements"} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="input-field">
                    <option>Announcements</option><option>Events</option><option>Results</option><option>Campus</option>
                  </select>
                </Field>
              </div>
              <Field label="Excerpt"><textarea rows={2} value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="input-field" /></Field>
              <Field label="Body"><textarea rows={8} value={editing.body ?? ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} className="input-field" placeholder="Use blank lines to separate paragraphs" /></Field>
              <Field label="Cover image"><ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} folder="blogs" /></Field>
              <label className="inline-flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={editing.published ?? true} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Published</label>
            </div>
            <div className="p-5 border-t flex justify-end gap-2 sticky bottom-0 bg-card rounded-b-2xl">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-md border text-sm hover:bg-secondary">Cancel</button>
              <button onClick={save} disabled={saving || !editing.title} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60 inline-flex items-center gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.input-field{width:100%;border-radius:0.375rem;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:0.5rem 0.75rem;font-size:0.875rem}.input-field:focus{outline:none;box-shadow:0 0 0 2px hsl(var(--ring))}`}</style>
    </div>
  );
}

/* ---------------- Page Content ---------------- */

function PageContentPanel() {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    supabase.from("site_content").select("*").eq("page", "blog").order("section").order("sort_order")
      .then(({ data }) => { setRows((data as ContentRow[]) || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const g = new Map<string, ContentRow[]>();
    rows.forEach((r) => { if (!g.has(r.section)) g.set(r.section, []); g.get(r.section)!.push(r); });
    return Array.from(g.entries());
  }, [rows]);

  const valueOf = (r: ContentRow) => (edits[r.id] !== undefined ? edits[r.id] : r.value || "");
  const dirty = Object.keys(edits).length > 0;

  const save = async () => {
    setSaving(true);
    try {
      for (const [id, value] of Object.entries(edits)) {
        await supabase.from("site_content").update({ value }).eq("id", id);
      }
      setEdits({}); load();
      setSavedAt(Date.now()); setTimeout(() => setSavedAt(null), 2500);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="h-48 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end gap-3">
        {savedAt && <span className="text-sm text-emerald-600 inline-flex items-center gap-1"><Check className="h-4 w-4" /> Saved</span>}
        <button onClick={save} disabled={!dirty || saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gold text-gold-foreground text-sm font-semibold disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
        </button>
      </div>
      {grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground">No content fields for the News page.</p>
      ) : grouped.map(([section, items]) => (
        <div key={section} className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-primary capitalize mb-4">{section.replace(/_/g, " ")}</h3>
          <div className="space-y-4">
            {items.map((r) => (
              <div key={r.id}>
                <label className="block text-sm font-medium mb-1.5">{r.label}</label>
                {r.field_type === "textarea" ? (
                  <textarea value={valueOf(r)} onChange={(e) => setEdits((p) => ({ ...p, [r.id]: e.target.value }))} rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                ) : r.field_type === "image" ? (
                  <ImageUpload value={valueOf(r) || null} onChange={(url) => setEdits((p) => ({ ...p, [r.id]: url || "" }))} folder="site/blog" hint={r.hint} />
                ) : (
                  <input type={r.field_type === "url" ? "url" : "text"} value={valueOf(r)} onChange={(e) => setEdits((p) => ({ ...p, [r.id]: e.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                )}
                {r.hint && <p className="text-xs text-muted-foreground mt-1">{r.hint}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Small UI ---------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-sm font-medium text-primary block mb-1.5">{label}</label>{children}</div>;
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "success" | "muted" }) {
  const color = tone === "success" ? "text-emerald-600" : tone === "muted" ? "text-muted-foreground" : "text-primary";
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function IconBtn({ children, onClick, title, tone }: { children: React.ReactNode; onClick: () => void; title: string; tone?: "danger" }) {
  return (
    <button title={title} onClick={onClick} className={`p-2 rounded-md transition ${tone === "danger" ? "hover:bg-destructive/10 text-destructive" : "hover:bg-secondary text-foreground"}`}>
      {children}
    </button>
  );
}
