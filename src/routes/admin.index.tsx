import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Newspaper, Megaphone, Users, Inbox, MessageSquare, Image as ImageIcon, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard | Admin", }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

type Counts = { 
  blogs: number; 
  notices: number; 
  teachers: number; 
  gallery: number; 
  admissions: number; 
  inquiries: number; 
  results: number;
  newAdmissions: number;
};

function AdminDashboard() {
  const [c, setC] = useState<Counts | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const getCount = async (table: string, eqFilter?: { col: string; val: any }) => {
        try {
          let q = supabase.from(table).select("*", { count: "exact", head: true });
          if (eqFilter) {
            q = q.eq(eqFilter.col, eqFilter.val);
          }
          const { count, error } = await q;
          if (error) {
            console.error(`[Dashboard] Error fetching count for ${table}:`, error);
            return 0;
          }
          return count ?? 0;
        } catch (err) {
          console.error(`[Dashboard] Failed to fetch count for ${table}:`, err);
          return 0;
        }
      };

      const [blogs, notices, teachers, gallery, admissions, inquiries, results, newAdmissions] = await Promise.all([
        getCount("blogs"),
        getCount("notices"),
        getCount("teachers"),
        getCount("gallery_items"),
        getCount("admission_applications"),
        getCount("contact_inquiries"),
        getCount("student_results"),
        getCount("admission_applications", { col: "status", val: "new" }),
      ]);

      if (active) {
        setC({
          blogs,
          notices,
          teachers,
          gallery,
          admissions,
          inquiries,
          results,
          newAdmissions,
        });
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: "Blogs", value: c?.blogs, icon: Newspaper, color: "bg-blue-500/10 text-blue-700", to: "/admin/blogs" },
    { label: "Notices", value: c?.notices, icon: Megaphone, color: "bg-amber-500/10 text-amber-700", to: "/admin/notices" },
    { label: "Teachers", value: c?.teachers, icon: Users, color: "bg-emerald-500/10 text-emerald-700", to: "/admin/teachers" },
    { label: "Gallery", value: c?.gallery, icon: ImageIcon, color: "bg-purple-500/10 text-purple-700", to: "/admin/gallery" },
    { label: "Student Results", value: c?.results, icon: Award, color: "bg-indigo-500/10 text-indigo-700", to: "/admin/results" },
    { label: "Admissions", value: c?.admissions, icon: Inbox, color: "bg-rose-500/10 text-rose-700", badge: c?.newAdmissions, to: "/admin/admissions" },
    { label: "Inquiries", value: c?.inquiries, icon: MessageSquare, color: "bg-sky-500/10 text-sky-700", to: "/admin/inquiries" },
  ];

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary">Welcome back</h2>
      <p className="text-muted-foreground text-sm mt-1">Manage your school website content and review inquiries.</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to as any}
            className="rounded-2xl border bg-card p-6 hover:shadow-elegant hover:-translate-y-0.5 transition-all cursor-pointer block"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{card.label}</div>
                <div className="mt-2 text-3xl font-display font-bold text-primary">
                  {card.value ?? "—"}
                </div>
                {card.badge ? (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/20 text-xs font-semibold text-primary">
                    {card.badge} new
                  </div>
                ) : null}
              </div>
              <div className={`h-11 w-11 rounded-xl grid place-items-center ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

