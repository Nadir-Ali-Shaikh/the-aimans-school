import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Loader2, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/notices")({
  head: () => ({ meta: [{ title: "Notices | Admin" }, { name: "robots", content: "noindex" }] }),
  component: NoticesAdmin,
});

type Notice = { id: string; title: string; body: string | null; important: boolean; published: boolean; published_at: string };

function NoticesAdmin() {
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Notice> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("notices").select("*").order("published_at", { ascending: false });
    setItems((data ?? []) as Notice[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload: any = { title: editing.title, body: editing.body, important: editing.important ?? false, published: editing.published ?? true };
    const res = editing.id
      ? await supabase.from("notices").update(payload).eq("id", editing.id)
      : await supabase.from("notices").insert(payload);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    await supabase.from("notices").delete().eq("id", id); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground text-sm">Quick announcements shown on the website.</p>
        <button onClick={() => setEditing({ important: false, published: true })} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
          <Plus className="h-4 w-4" /> New notice
        </button>
      </div>

      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <div className="grid gap-3">
          {items.length === 0 && <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">No notices yet.</div>}
          {items.map((n) => (
            <div key={n.id} className="rounded-2xl border bg-card p-5 flex gap-4">
              <div className={`h-10 w-10 rounded-xl grid place-items-center flex-shrink-0 ${n.important ? "bg-destructive/15 text-destructive" : "bg-gold/15 text-primary"}`}>
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-primary">{n.title}</h3>
                  {n.important && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">Important</span>}
                  {!n.published && <span className="text-xs px-2 py-0.5 rounded-full bg-muted">Draft</span>}
                </div>
                {n.body && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{n.body}</p>}
                <div className="text-xs text-muted-foreground mt-1">{new Date(n.published_at).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(n)} className="p-2 hover:bg-secondary rounded"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(n.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl w-full max-w-2xl shadow-2xl border overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary to-primary/90 text-primary-foreground px-7 py-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gold text-gold-foreground grid place-items-center flex-shrink-0 shadow-lg">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] tracking-[0.2em] text-gold uppercase font-semibold">
                    {editing.id ? "Edit Notice" : "Create New Notice"}
                  </div>
                  <h3 className="font-display text-2xl font-bold mt-1 leading-tight">
                    {editing.id ? "Update announcement" : "Publish an announcement"}
                  </h3>
                  <p className="text-sm text-primary-foreground/70 mt-1">
                    Quick announcements shown live on the school website.
                  </p>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10 transition flex-shrink-0"
                  aria-label="Close"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-7 py-6 space-y-5 overflow-y-auto">
              <div>
                <label className="text-sm font-semibold text-primary block mb-2">
                  Notice title <span className="text-destructive">*</span>
                </label>
                <input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="e.g. School closed on Friday"
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Keep it short and clear — this is the headline parents will see.</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-primary block mb-2">Details</label>
                <textarea
                  rows={5}
                  value={editing.body ?? ""}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  placeholder="Add timing, location or any extra information…"
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Optional. {(editing.body ?? "").length} characters.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${editing.important ? "border-destructive bg-destructive/5" : "border-border hover:border-muted-foreground/30"}`}>
                  <input
                    type="checkbox"
                    checked={editing.important ?? false}
                    onChange={(e) => setEditing({ ...editing, important: e.target.checked })}
                    className="mt-0.5 h-4 w-4 accent-destructive"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-primary">Mark as important</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Highlighted with a red badge on the site.</div>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${(editing.published ?? true) ? "border-green-500 bg-green-500/5" : "border-border hover:border-muted-foreground/30"}`}>
                  <input
                    type="checkbox"
                    checked={editing.published ?? true}
                    onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                    className="mt-0.5 h-4 w-4 accent-green-600"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-primary">Publish now</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Uncheck to save as a draft instead.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t bg-secondary/40 flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground hidden sm:block">
                {editing.id ? "Changes go live on save." : "New notice will appear immediately if published."}
              </div>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-lg border bg-card hover:bg-secondary text-sm font-medium transition">
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={!editing.title}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                >
                  <Megaphone className="h-4 w-4" />
                  {editing.id ? "Save changes" : "Publish notice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
