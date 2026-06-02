import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Loader2, RefreshCw, FolderPlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/admin/gallery")({
  head: () => ({ meta: [{ title: "Gallery | Admin" }, { name: "robots", content: "noindex" }] }),
  component: GalleryAdmin,
});

type Item = { id: string; title: string | null; image_url: string; category: string | null; sort_order: number };
type Section = { id: string; name: string; sort_order: number };

function GalleryAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [replacing, setReplacing] = useState<Item | null>(null);
  const [replaceUrl, setReplaceUrl] = useState<string | null>(null);
  const [newSection, setNewSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const load = async () => {
    setLoading(true);
    const [itemsRes, sectionsRes] = await Promise.all([
      supabase.from("gallery_items").select("*").order("sort_order").order("created_at", { ascending: false }),
      supabase.from("gallery_sections").select("*").order("sort_order").order("name"),
    ]);
    setItems((itemsRes.data ?? []) as Item[]);
    setSections((sectionsRes.data ?? []) as Section[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const m = new Map<string, Item[]>();
    sections.forEach((s) => m.set(s.name, []));
    items.forEach((it) => {
      const k = it.category ?? "Uncategorized";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(it);
    });
    return Array.from(m.entries());
  }, [items, sections]);

  const add = async () => {
    if (!imageUrl || !adding) return;
    const res = await supabase.from("gallery_items").insert({ title: title || null, category: adding, image_url: imageUrl });
    if (res.error) { alert(res.error.message); return; }
    setAdding(null); setTitle(""); setImageUrl(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    await supabase.from("gallery_items").delete().eq("id", id);
    load();
  };

  const saveReplace = async () => {
    if (!replacing || !replaceUrl) return;
    const res = await supabase.from("gallery_items").update({ image_url: replaceUrl }).eq("id", replacing.id);
    if (res.error) { alert(res.error.message); return; }
    setReplacing(null); setReplaceUrl(null); load();
  };

  const addSection = async () => {
    const name = newSectionName.trim();
    if (!name) return;
    const maxOrder = sections.reduce((m, s) => Math.max(m, s.sort_order), 0);
    const res = await supabase.from("gallery_sections").insert({ name, sort_order: maxOrder + 1 });
    if (res.error) { alert(res.error.message); return; }
    setNewSection(false); setNewSectionName(""); load();
  };

  const removeSection = async (s: Section, imageCount: number) => {
    const msg = imageCount > 0
      ? `Delete section "${s.name}" AND its ${imageCount} image${imageCount === 1 ? "" : "s"}? This cannot be undone.`
      : `Delete section "${s.name}"?`;
    if (!confirm(msg)) return;
    if (imageCount > 0) {
      await supabase.from("gallery_items").delete().eq("category", s.name);
    }
    const res = await supabase.from("gallery_sections").delete().eq("id", s.id);
    if (res.error) { alert(res.error.message); return; }
    load();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">Images grouped by section. Each section matches a facility on the public site.</p>
        <button
          onClick={() => { setNewSection(true); setNewSectionName(""); }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gold text-gold-foreground text-sm font-semibold"
        >
          <FolderPlus className="h-4 w-4" /> New section
        </button>
      </div>

      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <div className="space-y-10">
          {grouped.length === 0 && (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No sections yet. Click "New section" to create one.
            </div>
          )}
          {grouped.map(([cat, list]) => {
            const section = sections.find((s) => s.name === cat);
            return (
              <div key={cat} className="rounded-2xl border bg-card p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-primary">{cat}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{list.length} image{list.length === 1 ? "" : "s"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setAdding(cat); setTitle(""); setImageUrl(null); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
                    >
                      <Plus className="h-4 w-4" /> Add image
                    </button>
                    {section && (
                      <button
                        onClick={() => removeSection(section, list.length)}
                        title="Delete section"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-destructive/40 text-destructive text-sm font-semibold hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" /> Section
                      </button>
                    )}
                  </div>
                </div>

                {list.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No images in this section yet.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {list.map((it) => (
                      <div key={it.id} className="group relative aspect-square rounded-xl overflow-hidden border bg-secondary">
                        <img src={it.image_url} alt={it.title ?? ""} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => { setReplacing(it); setReplaceUrl(it.image_url); }}
                              title="Replace"
                              className="h-8 w-8 rounded-full bg-white/90 text-primary grid place-items-center hover:bg-white"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => remove(it.id)}
                              title="Delete"
                              className="h-8 w-8 rounded-full bg-destructive text-destructive-foreground grid place-items-center"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {it.title && <div className="text-white text-xs font-semibold truncate">{it.title}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New section modal */}
      {newSection && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-primary">New section</h3>
              <button onClick={() => setNewSection(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6">
              <label className="text-sm font-medium text-primary block mb-1">Section name</label>
              <input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="e.g. Annual Day 2026"
                className="input"
                autoFocus
              />
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button onClick={() => setNewSection(false)} className="px-4 py-2 rounded-md border text-sm">Cancel</button>
              <button onClick={addSection} disabled={!newSectionName.trim()} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Add image modal */}
      {adding && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b">
              <h3 className="font-display text-xl font-bold text-primary">Add image</h3>
              <p className="text-sm text-muted-foreground mt-1">Section: <span className="font-medium text-foreground">{adding}</span></p>
            </div>
            <div className="p-6 grid gap-4">
              <div>
                <label className="text-sm font-medium text-primary block mb-1">Title (optional)</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
              </div>
              <div>
                <label className="text-sm font-medium text-primary block mb-1">Image</label>
                <ImageUpload value={imageUrl} onChange={setImageUrl} folder="gallery" hint="Recommended 1200×900px" />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button onClick={() => { setAdding(null); setImageUrl(null); setTitle(""); }} className="px-4 py-2 rounded-md border text-sm">Cancel</button>
              <button onClick={add} disabled={!imageUrl} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Replace modal */}
      {replacing && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b">
              <h3 className="font-display text-xl font-bold text-primary">Replace image</h3>
              <p className="text-sm text-muted-foreground mt-1">Section: <span className="font-medium text-foreground">{replacing.category}</span></p>
            </div>
            <div className="p-6">
              <ImageUpload value={replaceUrl} onChange={setReplaceUrl} folder="gallery" hint="Recommended 1200×900px" />
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button onClick={() => { setReplacing(null); setReplaceUrl(null); }} className="px-4 py-2 rounded-md border text-sm">Cancel</button>
              <button onClick={saveReplace} disabled={!replaceUrl || replaceUrl === replacing.image_url} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
