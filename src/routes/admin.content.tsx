import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, Check, Plus, Trash2, HelpCircle } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content")({
  head: () => ({ meta: [{ title: "Site Content | Admin" }, { name: "robots", content: "noindex" }] }),
  component: ContentEditor,
});

type Row = {
  id: string;
  page: string;
  section: string;
  field_key: string;
  label: string;
  field_type: "text" | "textarea" | "image" | "url";
  value: string | null;
  sort_order: number;
  hint: string | null;
};

const PAGES: { key: string; label: string }[] = [
  { key: "global", label: "🌐 Global / Brand" },
  { key: "home", label: "🏠 Home" },
  { key: "about", label: "ℹ️ About" },
  { key: "academics", label: "📚 Academics" },
  { key: "facilities", label: "🏫 Facilities" },
  { key: "admissions", label: "📝 Admissions" },
  { key: "gallery", label: "🖼️ Gallery" },
  { key: "blog", label: "✍️ Blog" },
  { key: "results", label: "📊 Results" },
  { key: "contact", label: "📞 Contact" },
];

function ContentEditor() {
  const [page, setPage] = useState("home");
  const [rows, setRows] = useState<Row[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Custom Field Form State
  const [showAddField, setShowAddField] = useState(false);
  const [newSection, setNewSection] = useState("");
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "textarea" | "image" | "url">("text");
  const [newHint, setNewHint] = useState("");
  const [addingField, setAddingField] = useState(false);

  const loadRows = async () => {
    setLoading(true);
    setEdits({});
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("page", page)
        .order("section")
        .order("sort_order");
        
      if (error) {
        toast.error("Failed to load content fields: " + error.message);
      } else {
        setRows((data as Row[]) || []);
      }
    } catch (err: any) {
      toast.error("An error occurred while loading content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, [page]);

  const grouped = useMemo(() => {
    const g = new Map<string, Row[]>();
    rows.forEach((r) => {
      if (!g.has(r.section)) g.set(r.section, []);
      g.get(r.section)!.push(r);
    });
    return Array.from(g.entries());
  }, [rows]);

  const setVal = (id: string, v: string) =>
    setEdits((e) => ({ ...e, [id]: v }));

  const valueOf = (r: Row) => (edits[r.id] !== undefined ? edits[r.id] : r.value || "");
  const dirty = Object.keys(edits).length > 0;

  const save = async () => {
    setSaving(true);
    try {
      for (const [id, value] of Object.entries(edits)) {
        const { error } = await supabase.from("site_content").update({ value }).eq("id", id);
        if (error) throw error;
      }
      toast.success("All changes saved successfully!");
      setEdits({});
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2500);
      loadRows();
    } catch (err: any) {
      toast.error("Failed to save changes: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSection || !newFieldKey || !newLabel) {
      toast.error("Section, Field Key, and Label are required!");
      return;
    }

    setAddingField(true);
    const section_safe = newSection.toLowerCase().trim().replace(/[-\s]+/g, "_");
    const key_safe = newFieldKey.toLowerCase().trim().replace(/[-\s]+/g, "_");
    const sort_order = rows.length > 0 ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;

    try {
      const { error } = await supabase.from("site_content").insert({
        page,
        section: section_safe,
        field_key: key_safe,
        label: newLabel.trim(),
        field_type: newFieldType,
        value: "",
        sort_order,
        hint: newHint.trim() || null,
      });

      if (error) {
        toast.error("Failed to add field: " + error.message);
      } else {
        toast.success(`Successfully added "${newLabel}" to section "${section_safe}"!`);
        setNewSection("");
        setNewFieldKey("");
        setNewLabel("");
        setNewHint("");
        setShowAddField(false);
        loadRows();
      }
    } catch (err: any) {
      toast.error("An error occurred while adding the field.");
    } finally {
      setAddingField(false);
    }
  };

  const handleDeleteField = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete the field "${label}"? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase.from("site_content").delete().eq("id", id);
      if (error) {
        toast.error("Failed to delete field: " + error.message);
      } else {
        toast.success(`Deleted field "${label}" successfully.`);
        loadRows();
      }
    } catch (err: any) {
      toast.error("An error occurred while deleting the field.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-primary capitalize">{page} Page Editor</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage text content, headlines, and image banners displayed on the frontend.</p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto">
          {savedAt && (
            <span className="text-sm text-green-600 inline-flex items-center gap-1 animate-fade-in">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold text-gold-foreground font-semibold hover:brightness-105 transition disabled:opacity-50 shadow cursor-pointer text-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* TABS VIEW */}
      <div className="flex flex-wrap gap-2 bg-secondary/30 p-2 rounded-xl border">
        {PAGES.map((p) => (
          <button
            key={p.key}
            onClick={() => setPage(p.key)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
              page === p.key
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:bg-secondary hover:text-primary"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ADD CUSTOM FIELD PANEL */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <button
          onClick={() => setShowAddField(!showAddField)}
          className="flex items-center justify-between w-full px-6 py-4 font-semibold text-primary hover:bg-secondary/20 transition text-left"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-gold" />
            Add Custom Field to this Page
          </span>
          <span className="text-xs px-2.5 py-1 rounded bg-secondary text-primary uppercase tracking-wide">
            {showAddField ? "Close Form" : "Open Form"}
          </span>
        </button>

        {showAddField && (
          <form onSubmit={handleAddField} className="p-6 border-t bg-secondary/10 grid md:grid-cols-2 gap-4 animate-fade-up">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Section Key (e.g. hero, welcome) *</label>
              <input
                type="text"
                required
                placeholder="e.g. hero"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Field Key (e.g. title, subtitle) *</label>
              <input
                type="text"
                required
                placeholder="e.g. title"
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Label (Display Name) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Hero Headline"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Field Type *</label>
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as any)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                <option value="text">Text Input (Short)</option>
                <option value="textarea">Textarea (Paragraphs)</option>
                <option value="image">Image Upload File</option>
                <option value="url">URL Link</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Helper Hint (e.g. Recommended size 1920x1080)</label>
              <input
                type="text"
                placeholder="Recommended dimensions, requirements, etc."
                value={newHint}
                onChange={(e) => setNewHint(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowAddField(false)}
                className="px-4 py-2 text-sm border rounded-lg bg-card font-medium hover:bg-secondary/30 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingField}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
              >
                {addingField ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Field
              </button>
            </div>
          </form>
        )}
      </div>

      {/* CORE FIELDS SECTION */}
      {loading ? (
        <div className="h-64 grid place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([section, items]) => (
            <div key={section} className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-display text-xl font-bold text-primary capitalize flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gold" />
                  {section.replace(/_/g, " ")}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gold/10 text-primary uppercase tracking-wide">
                  {items.length} Field{items.length !== 1 && "s"}
                </span>
              </div>

              <div className="grid gap-6">
                {items.map((r) => {
                  const val = valueOf(r);
                  return (
                    <div key={r.id} className="relative group/field border bg-secondary/5 p-4 md:p-5 rounded-xl border-dashed hover:border-gold/30 hover:bg-secondary/10 transition">
                      
                      {/* Delete button absolute corner */}
                      <button
                        onClick={() => handleDeleteField(r.id, r.label)}
                        className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover/field:opacity-100 cursor-pointer"
                        title="Delete this custom field"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="flex items-center gap-1.5 mb-2 pr-6">
                        <label className="text-sm font-bold text-primary flex items-center gap-1">
                          {r.label}
                        </label>
                        {r.hint && (
                          <div className="group relative cursor-help">
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-gold transition" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-48 bg-primary text-primary-foreground text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition z-10 whitespace-normal">
                              {r.hint}
                            </div>
                          </div>
                        )}
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                          {r.field_type}
                        </span>
                      </div>

                      {/* RENDERING DYNAMIC EDITORS */}
                      <div className="grid gap-3">
                        {r.field_type === "image" ? (
                          <div className="grid md:grid-cols-5 gap-4 items-start">
                            
                            {/* Rich Preview Image inline (jo image jis page ki ho wo admin site usi page pa show ho) */}
                            <div className="md:col-span-3">
                              <label className="block text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Live Image Preview</label>
                              {val ? (
                                <div className="relative group overflow-hidden rounded-lg border aspect-[16/8] max-w-lg bg-black/5">
                                  <img
                                    src={val}
                                    alt={r.label}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold bg-primary/80 px-3 py-1.5 rounded-full shadow">Current Live Banner</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed aspect-[16/8] max-w-lg bg-secondary/20 text-center p-4">
                                  <span className="text-xs text-muted-foreground">No image set. Upload one to display it on the frontend.</span>
                                </div>
                              )}
                            </div>

                            {/* Uploader control */}
                            <div className="md:col-span-2">
                              <label className="block text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Upload / Change Image</label>
                              <ImageUpload
                                value={val || null}
                                onChange={(url) => setVal(r.id, url || "")}
                                folder={`site/${page}/${section}`}
                                hint={r.hint}
                              />
                            </div>
                          </div>
                        ) : r.field_type === "textarea" ? (
                          <textarea
                            value={val}
                            onChange={(e) => setVal(r.id, e.target.value)}
                            rows={4}
                            placeholder={`Enter text content for ${r.label.toLowerCase()}`}
                            className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                          />
                        ) : (
                          <input
                            type={r.field_type === "url" ? "url" : "text"}
                            value={val}
                            onChange={(e) => setVal(r.id, e.target.value)}
                            placeholder={`Enter ${r.label.toLowerCase()} link or text`}
                            className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {grouped.length === 0 && (
            <div className="rounded-2xl border border-dashed bg-card p-12 text-center text-muted-foreground animate-fade-in">
              <p className="font-semibold text-lg">No content fields for this page yet.</p>
              <p className="text-sm mt-1 max-w-md mx-auto">Use the "Add Custom Field" form above to create the first content key for this page!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
