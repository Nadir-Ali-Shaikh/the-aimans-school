import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Trash2, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/admissions")({
  head: () => ({ meta: [{ title: "Admissions Inbox | Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdmissionsAdmin,
});

type App = {
  id: string; parent_name: string; phone: string; email: string | null;
  student_name: string; class_applying: string; message: string | null;
  status: string; created_at: string;
};

const STATUSES = ["new", "contacted", "enrolled", "rejected"];

function AdmissionsAdmin() {
  const [items, setItems] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const q = supabase.from("admission_applications").select("*").order("created_at", { ascending: false });
    const { data } = filter === "all" ? await q : await q.eq("status", filter);
    setItems((data ?? []) as App[]); setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("admission_applications").update({ status }).eq("id", id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    await supabase.from("admission_applications").delete().eq("id", id); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-muted-foreground text-sm">Applications submitted via the admissions form.</p>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-md border bg-card px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <div className="grid gap-3">
          {items.length === 0 && <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">No applications.</div>}
          {items.map((a) => (
            <div key={a.id} className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <h3 className="font-semibold text-primary">{a.student_name} <span className="text-muted-foreground font-normal">· {a.class_applying}</span></h3>
                  <div className="text-sm text-muted-foreground mt-1">Parent: {a.parent_name}</div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1 text-primary hover:text-gold"><Phone className="h-3.5 w-3.5" /> {a.phone}</a>
                    {a.email && <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1 text-primary hover:text-gold"><Mail className="h-3.5 w-3.5" /> {a.email}</a>}
                  </div>
                  {a.message && <p className="mt-3 text-sm text-foreground bg-secondary rounded-md p-3">{a.message}</p>}
                  <div className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)} className="rounded-md border bg-background px-3 py-1.5 text-sm capitalize">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => remove(a.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
