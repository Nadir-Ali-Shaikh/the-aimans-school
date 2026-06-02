import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Section";
import { Search, Loader2, Printer, ArrowLeft } from "lucide-react";
import { useState } from "react";
import heroImg from "@/assets/hero-campus.jpg";
import { useSiteContent } from "@/hooks/use-site-content";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Result Portal | The Aiman's School Umerkot" },
      { name: "description", content: "Check your result by selecting your class and entering your seat number." },
      { property: "og:title", content: "Result Portal — The Aiman's School Umerkot" },
      { property: "og:description", content: "Class-wise online result lookup." },
      { property: "og:url", content: "/results" },
    ],
    links: [{ rel: "canonical", href: "/results" }],
  }),
  component: Results,
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

function Results() {
  const c = useSiteContent("results");
  const heroImage = c.get("hero", "image_url") || heroImg;
  const [classLevel, setClassLevel] = useState<number | "">("");
  const [seat, setSeat] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [notFound, setNotFound] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classLevel || !seat.trim()) return;
    setLoading(true); setNotFound(false); setResult(null);
    const { data } = await supabase
      .from("student_results")
      .select("*")
      .eq("class_level", classLevel)
      .ilike("seat_number", seat.trim())
      .maybeSingle();
    setLoading(false);
    if (!data) { setNotFound(true); return; }
    setResult(data as any);
  };

  const reset = () => { setResult(null); setNotFound(false); setSeat(""); };

  return (
    <>
      <PageHero
        eyebrow="Result Portal"
        title="Check your result online."
        description="Select your class and enter your seat number to view your result."
        image={heroImage}
      />
      <section className="py-16 print:py-0">
        <div className="container-prose max-w-3xl">
          {!result ? (
            <div className="rounded-2xl border bg-card p-8 shadow-elegant">
              <form onSubmit={lookup} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-primary mb-2 block">Select Your Class</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {CLASSES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setClassLevel(c)}
                        className={`py-3 rounded-md border text-sm font-semibold transition ${classLevel === c ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary"}`}
                      >
                        Class {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-primary">Seat Number</label>
                  <input
                    required
                    maxLength={30}
                    value={seat}
                    onChange={(e) => setSeat(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 text-sm"
                    placeholder="e.g. 2026-AS-0123"
                  />
                </div>

                <button
                  disabled={loading || !classLevel}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md bg-white text-[oklch(0.22_0.06_258)] font-semibold shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:bg-white/95 hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Check Result
                </button>

                {notFound && (
                  <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                    No result found for Class {classLevel}, seat number "{seat}". Please verify and try again.
                  </div>
                )}
              </form>
            </div>
          ) : (
            <ResultCard result={result} onBack={reset} />
          )}
        </div>
      </section>
    </>
  );
}

function ResultCard({ result, onBack }: { result: Result; onBack: () => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Check another
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-white text-[oklch(0.22_0.06_258)] hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all px-4 py-2 text-sm font-semibold">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden shadow-elegant">
        <div className="bg-[#152A4A] border-b border-white/10 text-white p-6 text-center">
          <div className="text-xs tracking-[0.2em] text-white/60 uppercase">The Aiman's School Umerkot</div>
          <h2 className="font-display text-2xl font-bold mt-1">{result.exam_name} {result.session ? `— ${result.session}` : ""}</h2>
          <div className="text-sm opacity-80 mt-1">Class {result.class_level} Result Card</div>
        </div>

        <div className="p-6 grid sm:grid-cols-2 gap-4 border-b">
          <Info label="Student Name" value={result.student_name} />
          {result.father_name && <Info label="Father's Name" value={result.father_name} />}
          <Info label="Class" value={`Class ${result.class_level}`} />
          <Info label="Seat Number" value={result.seat_number} />
        </div>

        {result.subjects && result.subjects.length > 0 && (
          <div className="p-6">
            <h3 className="font-semibold text-primary mb-3">Subjects</h3>
            <table className="w-full text-sm border">
              <thead className="bg-secondary text-primary">
                <tr>
                  <th className="text-left px-3 py-2">Subject</th>
                  <th className="text-right px-3 py-2">Total</th>
                  <th className="text-right px-3 py-2">Obtained</th>
                </tr>
              </thead>
              <tbody>
                {result.subjects.map((s, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2 text-right">{s.total}</td>
                    <td className="px-3 py-2 text-right font-medium">{s.obtained}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-6 bg-secondary grid sm:grid-cols-4 gap-4 text-center">
          <Stat label="Total Marks" value={String(result.total_marks)} />
          <Stat label="Obtained" value={String(result.obtained_marks)} />
          <Stat label="Percentage" value={`${result.percentage ?? 0}%`} />
          <Stat label="Grade" value={result.grade ?? "-"} highlight />
        </div>

        <div className="p-6 border-t flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <span className={`mt-1 inline-block rounded px-3 py-1 text-sm font-bold ${result.status === "pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {result.status.toUpperCase()}
            </span>
          </div>
          {result.remarks && (
            <div className="text-sm text-muted-foreground max-w-md text-right">
              <div className="text-xs">Remarks</div>
              <div className="text-primary">{result.remarks}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium text-primary">{value}</div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-display text-2xl font-bold ${highlight ? "text-gold" : "text-primary"}`}>{value}</div>
    </div>
  );
}
