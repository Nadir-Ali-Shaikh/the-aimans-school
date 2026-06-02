import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Trash2, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/inquiries")({
  head: () => ({ meta: [{ title: "Inquiries | Admin" }, { name: "robots", content: "noindex" }] }),
  component: InquiriesAdmin,
});

type Inq = { id: string; full_name: string; phone: string; email: string | null; subject: string; message: string; status: string; created_at: string };

function InquiriesAdmin() {
  const [items, setItems] = useState<Inq[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("contact_inquiries").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Inq[]); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, status: string) => {
    await supabase.from("contact_inquiries").update({ status: status === "resolved" ? "new" : "resolved" }).eq("id", id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    await supabase.from("contact_inquiries").delete().eq("id", id); load();
  };

  return (
    <div>
      <p className="text-muted-foreground text-sm mb-6">Messages submitted via the public contact form.</p>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <div className="grid gap-3">
          {items.length === 0 && <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">No inquiries.</div>}
          {items.map((i) => (
            <div key={i.id} className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <h3 className="font-semibold text-primary">{i.subject}</h3>
                  <div className="text-sm text-muted-foreground mt-1">From: {i.full_name}</div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <a href={`tel:${i.phone}`} className="inline-flex items-center gap-1 text-primary hover:text-gold"><Phone className="h-3.5 w-3.5" /> {i.phone}</a>
                    {i.email && <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1 text-primary hover:text-gold"><Mail className="h-3.5 w-3.5" /> {i.email}</a>}
                  </div>
                  <p className="mt-3 text-sm text-foreground bg-secondary rounded-md p-3 whitespace-pre-wrap">{i.message}</p>
                  <div className="text-xs text-muted-foreground mt-2">{new Date(i.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggle(i.id, i.status)} className={`text-xs px-3 py-1.5 rounded-full font-semibold ${i.status === "resolved" ? "bg-emerald-100 text-emerald-700" : "bg-gold/20 text-primary"}`}>
                    {i.status === "resolved" ? "Resolved" : "Mark resolved"}
                  </button>
                  <button onClick={() => remove(i.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
