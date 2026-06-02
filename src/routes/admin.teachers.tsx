import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Loader2, GraduationCap, User, BookOpen, FileText, ArrowUpDown, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/admin/teachers")({
  head: () => ({ meta: [{ title: "Teachers | Admin" }, { name: "robots", content: "noindex" }] }),
  component: TeachersAdmin,
});

type Teacher = { id: string; name: string; title: string | null; subject: string | null; bio: string | null; photo_url: string | null; sort_order: number };

function TeachersAdmin() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Teacher> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("teachers").select("*").order("sort_order").order("name");
    setItems((data ?? []) as Teacher[]); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload: any = { name: editing.name, title: editing.title, subject: editing.subject, bio: editing.bio, photo_url: editing.photo_url, sort_order: editing.sort_order ?? 0 };
    const res = editing.id
      ? await supabase.from("teachers").update(payload).eq("id", editing.id)
      : await supabase.from("teachers").insert(payload);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;
    await supabase.from("teachers").delete().eq("id", id); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground text-sm">Faculty profiles shown on the About page.</p>
        <button onClick={() => setEditing({ sort_order: 0 })} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
          <Plus className="h-4 w-4" /> New teacher
        </button>
      </div>

      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 && <div className="col-span-full rounded-2xl border bg-card p-8 text-center text-muted-foreground">No teachers yet.</div>}
          {items.map((t) => (
            <div key={t.id} className="rounded-2xl border bg-card p-5">
              <div className="flex gap-4">
                {t.photo_url ? <img src={t.photo_url} alt={t.name} className="h-16 w-16 rounded-xl object-cover" /> : <div className="h-16 w-16 rounded-xl bg-secondary" />}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-primary truncate">{t.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{t.title}</div>
                  <div className="text-xs text-gold font-semibold mt-1">{t.subject}</div>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-1">
                <button onClick={() => setEditing(t)} className="p-2 hover:bg-secondary rounded"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(t.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl w-full max-w-3xl my-8 shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary to-primary/90 text-primary-foreground px-7 py-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gold text-gold-foreground grid place-items-center flex-shrink-0 shadow-lg">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] tracking-[0.2em] text-gold uppercase font-semibold">
                    {editing.id ? "Edit Teacher" : "Add Teacher"}
                  </div>
                  <h3 className="font-display text-2xl font-bold mt-1 leading-tight">
                    {editing.id ? "Update faculty profile" : "Add a new faculty member"}
                  </h3>
                  <p className="text-sm text-primary-foreground/70 mt-1">
                    Faculty profiles appear on the About page.
                  </p>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10 transition flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-7 py-6 grid md:grid-cols-[200px_1fr] gap-7">
              {/* Photo */}
              <div>
                <label className="text-sm font-semibold text-primary block mb-2">Photo</label>
                <ImageUpload
                  value={editing.photo_url ?? null}
                  onChange={(url) => setEditing({ ...editing, photo_url: url })}
                  folder="teachers"
                />
                <p className="text-xs text-muted-foreground mt-2">Square portrait works best.</p>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Full name <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={editing.name ?? ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="e.g. Mr. Ahmed Khan"
                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" /> Designation
                    </label>
                    <input
                      value={editing.title ?? ""}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      placeholder="e.g. Principal, Senior Teacher"
                      className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Tip: Entering "Principal" or "Founder" features this profile in the prominent Leadership layout.
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" /> Subject
                    </label>
                    <input
                      value={editing.subject ?? ""}
                      onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                      placeholder="Mathematics"
                      className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Bio
                  </label>
                  <textarea
                    rows={4}
                    value={editing.bio ?? ""}
                    onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                    placeholder="Qualifications, experience, achievements…"
                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">{(editing.bio ?? "").length} characters</p>
                </div>

                <div className="max-w-[180px]">
                  <label className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5" /> Sort order
                  </label>
                  <input
                    type="number"
                    value={editing.sort_order ?? 0}
                    onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Lower numbers appear first.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t bg-secondary/40 flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground hidden sm:block">
                {editing.id ? "Changes save instantly." : "New faculty member will appear on the public site."}
              </div>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-lg border bg-card hover:bg-secondary text-sm font-medium transition">
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={!editing.name}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                >
                  <GraduationCap className="h-4 w-4" />
                  {editing.id ? "Save changes" : "Add teacher"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
