import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Pencil, Trash2, Search, X, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/results")({
  head: () => ({ meta: [{ title: "Results | Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminResults,
});

type Subject = { name: string; total: number; obtained: number };
type Result = {
  id: string;
  class_level: number;
  seat_number: string;
  student_name: string;
  father_name: string | null;
  exam_name: string;
  session: string | null;
  total_marks: number;
  obtained_marks: number;
  percentage: number | null;
  grade: string | null;
  status: string;
  remarks: string | null;
  subjects: Subject[];
};

const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);

const empty = (): Partial<Result> => ({
  class_level: 1,
  seat_number: "",
  student_name: "",
  father_name: "",
  exam_name: "Annual Exam",
  session: "2025-26",
  total_marks: 0,
  obtained_marks: 0,
  grade: "",
  status: "pass",
  remarks: "",
  subjects: [],
});

function calcGrade(p: number): string {
  if (p >= 90) return "A+";
  if (p >= 80) return "A";
  if (p >= 70) return "B";
  if (p >= 60) return "C";
  if (p >= 50) return "D";
  if (p >= 40) return "E";
  return "F";
}

function AdminResults() {
  const [rows, setRows] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Result> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("student_results")
      .select("*")
      .order("class_level", { ascending: true })
      .order("seat_number", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    if (classFilter !== "all" && r.class_level !== classFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.seat_number.toLowerCase().includes(q) ||
        r.student_name.toLowerCase().includes(q) ||
        (r.father_name?.toLowerCase() ?? "").includes(q)
      );
    }
    return true;
  });

  const byClass = CLASSES.map((c) => ({
    c,
    count: rows.filter((r) => r.class_level === c).length,
  }));

  const save = async () => {
    if (!editing) return;
    if (!editing.seat_number || !editing.student_name || !editing.class_level) {
      toast.error("Class, seat number and student name are required");
      return;
    }
    setSaving(true);
    const subjects = (editing.subjects ?? []) as Subject[];
    const total_marks = subjects.length
      ? subjects.reduce((s, x) => s + (Number(x.total) || 0), 0)
      : Number(editing.total_marks) || 0;
    const obtained_marks = subjects.length
      ? subjects.reduce((s, x) => s + (Number(x.obtained) || 0), 0)
      : Number(editing.obtained_marks) || 0;
    const percentage = total_marks > 0 ? Number(((obtained_marks / total_marks) * 100).toFixed(2)) : 0;
    const grade = editing.grade || calcGrade(percentage);
    const status = editing.status || (percentage >= 40 ? "pass" : "fail");

    const payload = {
      class_level: Number(editing.class_level),
      seat_number: editing.seat_number!.trim(),
      student_name: editing.student_name!.trim(),
      father_name: editing.father_name?.trim() || null,
      exam_name: editing.exam_name || "Annual Exam",
      session: editing.session?.trim() || null,
      total_marks,
      obtained_marks,
      percentage,
      grade,
      status,
      remarks: editing.remarks?.trim() || null,
      subjects,
    };

    const { error } = editing.id
      ? await supabase.from("student_results").update(payload).eq("id", editing.id)
      : await supabase.from("student_results").insert(payload);

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing.id ? "Result updated" : "Result added");
    setEditing(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this result?")) return;
    const { error } = await supabase.from("student_results").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Result deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Student Results</h1>
          <p className="text-sm text-muted-foreground">Manage results class-wise (Class 1 to 12).</p>
        </div>
        <button
          onClick={() => setEditing(empty())}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Result
        </button>
      </div>

      {/* Class chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setClassFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${classFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-secondary"}`}
        >
          All ({rows.length})
        </button>
        {byClass.map(({ c, count }) => (
          <button
            key={c}
            onClick={() => setClassFilter(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border inline-flex items-center gap-1.5 ${classFilter === c ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-secondary"}`}
          >
            <GraduationCap className="h-3 w-3" /> Class {c}
            <span className={`rounded-full px-1.5 ${classFilter === c ? "bg-white/20" : "bg-secondary"}`}>{count}</span>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search seat no, name…"
          className="w-full pl-9 pr-3 py-2 rounded-md border bg-card text-sm"
        />
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        {loading ? (
          <div className="p-10 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No results found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-primary">
                <tr>
                  <th className="text-left px-4 py-3">Class</th>
                  <th className="text-left px-4 py-3">Seat No.</th>
                  <th className="text-left px-4 py-3">Student</th>
                  <th className="text-left px-4 py-3">Exam</th>
                  <th className="text-left px-4 py-3">Marks</th>
                  <th className="text-left px-4 py-3">%</th>
                  <th className="text-left px-4 py-3">Grade</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-secondary/50">
                    <td className="px-4 py-3 font-semibold">{r.class_level}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.seat_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-primary">{r.student_name}</div>
                      {r.father_name && <div className="text-xs text-muted-foreground">S/o {r.father_name}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs">{r.exam_name}<div className="text-muted-foreground">{r.session}</div></td>
                    <td className="px-4 py-3">{r.obtained_marks}/{r.total_marks}</td>
                    <td className="px-4 py-3">{r.percentage ?? 0}%</td>
                    <td className="px-4 py-3"><span className="rounded bg-gold/20 text-gold px-2 py-0.5 text-xs font-bold">{r.grade}</span></td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${r.status === "pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => setEditing(r)} className="p-2 rounded hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => del(r.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl w-full max-w-3xl shadow-xl my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display text-xl font-bold text-primary">
                {editing.id ? "Edit Result" : "Add Result"}
              </h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded hover:bg-secondary"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Class *">
                  <select
                    value={editing.class_level}
                    onChange={(e) => setEditing({ ...editing, class_level: Number(e.target.value) })}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </Field>
                <Field label="Seat Number *">
                  <input value={editing.seat_number ?? ""} onChange={(e) => setEditing({ ...editing, seat_number: e.target.value })} className="input" />
                </Field>
                <Field label="Student Name *">
                  <input value={editing.student_name ?? ""} onChange={(e) => setEditing({ ...editing, student_name: e.target.value })} className="input" />
                </Field>
                <Field label="Father Name">
                  <input value={editing.father_name ?? ""} onChange={(e) => setEditing({ ...editing, father_name: e.target.value })} className="input" />
                </Field>
                <Field label="Exam Name">
                  <input value={editing.exam_name ?? ""} onChange={(e) => setEditing({ ...editing, exam_name: e.target.value })} className="input" />
                </Field>
                <Field label="Session">
                  <input value={editing.session ?? ""} onChange={(e) => setEditing({ ...editing, session: e.target.value })} placeholder="e.g. 2025-26" className="input" />
                </Field>
                <Field label="Status">
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="input">
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                  </select>
                </Field>
                <Field label="Grade (auto if empty)">
                  <input value={editing.grade ?? ""} onChange={(e) => setEditing({ ...editing, grade: e.target.value })} placeholder="A+" className="input" />
                </Field>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-primary text-sm">Subjects</h3>
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, subjects: [...(editing.subjects ?? []), { name: "", total: 100, obtained: 0 }] })}
                    className="text-xs inline-flex items-center gap-1 rounded bg-primary text-primary-foreground px-2 py-1"
                  >
                    <Plus className="h-3 w-3" /> Subject
                  </button>
                </div>
                {(editing.subjects ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">No subjects added. You can also set Total / Obtained manually below.</p>
                )}
                {(editing.subjects ?? []).map((s, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-6">
                      <label className="text-xs text-muted-foreground">Subject</label>
                      <input
                        value={s.name}
                        onChange={(e) => {
                          const subs = [...(editing.subjects ?? [])];
                          subs[i] = { ...subs[i], name: e.target.value };
                          setEditing({ ...editing, subjects: subs });
                        }}
                        className="input"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground">Total</label>
                      <input
                        type="number"
                        value={s.total}
                        onChange={(e) => {
                          const subs = [...(editing.subjects ?? [])];
                          subs[i] = { ...subs[i], total: Number(e.target.value) };
                          setEditing({ ...editing, subjects: subs });
                        }}
                        className="input"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs text-muted-foreground">Obtained</label>
                      <input
                        type="number"
                        value={s.obtained}
                        onChange={(e) => {
                          const subs = [...(editing.subjects ?? [])];
                          subs[i] = { ...subs[i], obtained: Number(e.target.value) };
                          setEditing({ ...editing, subjects: subs });
                        }}
                        className="input"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, subjects: (editing.subjects ?? []).filter((_, j) => j !== i) })}
                      className="col-span-1 p-2 rounded hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {(editing.subjects ?? []).length === 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Total Marks">
                    <input type="number" value={editing.total_marks ?? 0} onChange={(e) => setEditing({ ...editing, total_marks: Number(e.target.value) })} className="input" />
                  </Field>
                  <Field label="Obtained Marks">
                    <input type="number" value={editing.obtained_marks ?? 0} onChange={(e) => setEditing({ ...editing, obtained_marks: Number(e.target.value) })} className="input" />
                  </Field>
                </div>
              )}

              <Field label="Remarks">
                <textarea value={editing.remarks ?? ""} onChange={(e) => setEditing({ ...editing, remarks: e.target.value })} rows={2} className="input" />
              </Field>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-md border text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.input{width:100%;border-radius:0.375rem;border:1px solid hsl(var(--border));background:transparent;padding:0.5rem 0.75rem;font-size:0.875rem}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-primary">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
