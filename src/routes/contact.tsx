import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Section";
import { Mail, Phone, MapPin, Clock, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import heroImg from "@/assets/hero-campus.jpg";
import { useSiteContent } from "@/hooks/use-site-content";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | The Aiman's School Umerkot" },
      { name: "description", content: "Get in touch with The Aiman's School Umerkot — address, phone, email, WhatsApp and a contact form. We respond within one working day." },
      { property: "og:title", content: "Contact — The Aiman's School Umerkot" },
      { property: "og:description", content: "Get in touch with our school." },
      { property: "og:image", content: heroImg },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const sc = useSiteContent("contact");
  const heroImage = sc.get("hero", "image_url") || heroImg;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const full_name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = (formData.get("email") as string) || null;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    try {
      const { error } = await supabase.from("contact_inquiries").insert({
        full_name,
        phone,
        email,
        subject,
        message,
        status: "new",
      });

      if (error) {
        toast.error(error.message);
        console.error("Supabase insert error:", error);
      } else {
        toast.success("Message sent successfully!");
        setDone(true);
      }
    } catch (err: any) {
      toast.error("Failed to send message. Please try again.");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={sc.get("hero", "title", "We'd love to hear from you.")}
        description={sc.get("hero", "subtitle", "Whether you're a parent, prospective student or community partner — reach out and we'll respond within one working day.")}
        image={heroImage}
      />

      <section className="py-20">
        <div className="container-prose grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: MapPin, title: "Address", body: sc.get("info", "address", "Main Campus, Umerkot, Sindh, Pakistan") },
              { icon: Phone, title: "Phone", body: sc.get("info", "phone", "+92 342 3299800") },
              { icon: Mail, title: "Email", body: sc.get("info", "email", "info@theaimansschool.edu.pk") },
              { icon: Clock, title: "Office Hours", body: sc.get("info", "hours", "Mon – Sat, 8:00 AM – 3:00 PM") },
            ].map((c) => (
              <div key={c.title} className="flex gap-4 rounded-2xl border bg-card p-5">
                <div className="h-11 w-11 rounded-xl bg-gold/15 text-gold-foreground grid place-items-center">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-primary">{c.title}</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-line">{c.body}</div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 rounded-2xl bg-card border p-6 md:p-8 grid gap-4 animate-fade-in"
          >
            {done ? (
              <div className="text-center py-10">
                <div className="h-14 w-14 mx-auto rounded-full bg-gold/20 grid place-items-center"><Check className="h-7 w-7 text-gold" /></div>
                <h3 className="mt-4 font-display text-2xl font-bold text-primary">Message sent</h3>
                <p className="mt-2 text-muted-foreground">Thank you for reaching out. We'll get back to you shortly, Insha'Allah.</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-primary">Full Name *</label>
                    <input name="name" required maxLength={100} disabled={loading} className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 transition" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary">Phone *</label>
                    <input name="phone" required type="tel" maxLength={20} disabled={loading} className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 transition" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Email</label>
                  <input name="email" type="email" maxLength={120} disabled={loading} className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Subject *</label>
                  <input name="subject" required maxLength={150} disabled={loading} className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Message *</label>
                  <textarea name="message" required rows={5} maxLength={1000} disabled={loading} className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 transition" />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-prose">
          <div className="rounded-2xl overflow-hidden border shadow-elegant aspect-[16/7]">
            <iframe
              title="The Aiman's School Umerkot — Location"
              src="https://www.google.com/maps?q=The+Aiman's+School+Umerkot&ll=25.3603936,69.7397664&z=18&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="mt-4 text-center">
            <a
              href="https://www.google.com/maps/place/The+Aiman's+School+Umerkot/@25.3603936,69.7397664,18z"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-gold transition"
            >
              <MapPin className="h-4 w-4" /> Get Directions on Google Maps
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
