import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { Check, Download, FileText, CalendarCheck, UserCheck, Loader2 } from "lucide-react";
import heroImg from "@/assets/hero-campus.jpg";
import { useSiteContent } from "@/hooks/use-site-content";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions | The Aiman's School Umerkot" },
      { name: "description", content: "Admissions are open at The Aiman's School Umerkot. Apply online for Montessori, Primary, Secondary or College — quick, simple and parent-friendly." },
      { property: "og:title", content: "Admissions — The Aiman's School Umerkot" },
      { property: "og:description", content: "Apply online for the upcoming session." },
      { property: "og:image", content: heroImg },
      { property: "og:url", content: "/admissions" },
    ],
    links: [{ rel: "canonical", href: "/admissions" }],
  }),
  component: Admissions,
});

const steps = [
  { icon: FileText, title: "Fill the Form", desc: "Complete the online inquiry form below." },
  { icon: CalendarCheck, title: "Schedule a Visit", desc: "Our team will contact you to arrange a campus tour." },
  { icon: UserCheck, title: "Assessment", desc: "Light assessment & parent meeting." },
  { icon: Check, title: "Welcome Aboard", desc: "Receive offer letter and complete enrolment." },
];

function Admissions() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const c = useSiteContent("admissions");
  const heroImage = c.get("hero", "image_url") || heroImg;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const parent_name = formData.get("parent") as string;
    const phone = formData.get("phone") as string;
    const email = (formData.get("email") as string) || null;
    const student_name = formData.get("student") as string;
    const class_applying = formData.get("class") as string;
    const message = (formData.get("message") as string) || null;

    try {
      const { error } = await supabase.from("admission_applications").insert({
        parent_name,
        phone,
        email,
        student_name,
        class_applying,
        message,
        status: "new",
      });

      if (error) {
        toast.error(error.message);
        console.error("Supabase insert error:", error);
      } else {
        toast.success("Application submitted successfully!");
        setSubmitted(true);
      }
    } catch (err: any) {
      toast.error("Failed to submit inquiry. Please try again.");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Admissions Open"
        title="Begin your child's journey with us."
        description="A simple, transparent admissions process designed for busy parents — start online and we'll guide you the rest of the way."
        image={heroImage}
      />

      <section className="py-20">
        <div className="container-prose">
          <SectionHeading center eyebrow="How it Works" title="Four simple steps" />
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border bg-card p-6 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-gold text-gold-foreground grid place-items-center text-sm font-bold">{i + 1}</div>
                <s.icon className="h-7 w-7 mx-auto mt-3 text-primary" />
                <h3 className="mt-3 font-semibold text-primary">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="container-prose grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-3">Inquiry Form</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Tell us about your child.</h2>
            <p className="mt-4 text-muted-foreground">Fill the form — our admissions office will reach out within one working day. You can also call us directly at +92 342 3299800.</p>

            <a href="#" className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-md border border-primary/20 bg-card text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition">
              <Download className="h-4 w-4" /> Download Prospectus (PDF)
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 rounded-2xl bg-card border p-6 md:p-8 grid gap-4 animate-fade-in"
          >
            {submitted ? (
              <div className="text-center py-10">
                <div className="h-14 w-14 mx-auto rounded-full bg-gold/20 grid place-items-center"><Check className="h-7 w-7 text-gold" /></div>
                <h3 className="mt-4 font-display text-2xl font-bold text-primary">Thank you!</h3>
                <p className="mt-2 text-muted-foreground">Your inquiry has been received. Our admissions team will contact you shortly, Insha'Allah.</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Parent / Guardian Name" name="parent" required disabled={loading} />
                  <Field label="Mobile Number" name="phone" type="tel" required disabled={loading} />
                </div>
                <Field label="Email Address" name="email" type="email" disabled={loading} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Student Name" name="student" required disabled={loading} />
                  <div>
                    <label className="text-sm font-medium text-primary">Class Applying For</label>
                    <select required disabled={loading} className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50" name="class">
                      <option value="">Select…</option>
                      <option>Montessori</option>
                      <option>Primary (1–5)</option>
                      <option>Secondary (6–10)</option>
                      <option>College (XI–XII)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Message (optional)</label>
                  <textarea rows={4} name="message" maxLength={500} disabled={loading} className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50" placeholder="Anything you'd like us to know" />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Inquiry"
                  )}
                </button>
                <p className="text-xs text-muted-foreground">By submitting you agree to be contacted by The Aiman's School admissions office.</p>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", required, disabled }: { label: string; name: string; type?: string; required?: boolean; disabled?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium text-primary">{label}{required && <span className="text-destructive"> *</span>}</label>
      <input
        name={name}
        type={type}
        required={required}
        disabled={disabled}
        maxLength={150}
        className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 transition"
      />
    </div>
  );
}
