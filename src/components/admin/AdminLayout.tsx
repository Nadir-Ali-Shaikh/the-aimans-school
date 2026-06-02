import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Newspaper, Megaphone, Users, Image as ImageIcon,
  Inbox, MessageSquare, LogOut, Loader2, Menu, X, GraduationCap, ExternalLink, FileText, Award,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/content", label: "Site Content", icon: FileText },
  { to: "/admin/blogs", label: "Blogs", icon: Newspaper },
  { to: "/admin/notices", label: "Notices", icon: Megaphone },
  { to: "/admin/teachers", label: "Teachers", icon: Users },
  { to: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { to: "/admin/results", label: "Results", icon: Award },
  { to: "/admin/admissions", label: "Admissions", icon: Inbox },
  { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
];



export function AdminLayout() {
  const navigate = useNavigate();
  const { session, loading, isAdmin, roleLoading } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  useEffect(() => { setOpen(false); }, [path]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary px-4">
        <div className="max-w-md text-center rounded-2xl border bg-card p-10 shadow-elegant">
          <h1 className="font-display text-2xl font-bold text-primary">Access denied</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your account does not have admin access. Please contact the administrator.
          </p>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  const NavList = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV.map((n) => {
        const active = n.exact ? path === n.to : path === n.to || path.startsWith(n.to + "/");
        return (
          <Link
            key={n.to} to={n.to as "/admin"}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-300 ${
              active 
                ? "bg-white text-[oklch(0.22_0.06_258)] shadow-[0_0_15px_rgba(255,255,255,0.25)] font-semibold" 
                : "text-foreground/80 hover:text-white hover:bg-white/10 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
            }`}
          >
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-secondary">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-background text-foreground sticky top-0 h-screen">
        <Link to="/admin" className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
          <div className="h-9 w-9 rounded-lg bg-gold text-gold-foreground grid place-items-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold">Aiman's School</div>
            <div className="text-[10px] tracking-[0.2em] text-gold uppercase">Admin</div>
          </div>
        </Link>
        <NavList />
        <div className="p-3 border-t border-white/10 space-y-1">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-foreground/80 hover:bg-white/10">
            <ExternalLink className="h-4 w-4" /> View site
          </a>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-foreground/80 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
 
      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-background text-foreground flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
              <span className="font-display font-bold">Admin</span>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <NavList />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2"><Menu className="h-5 w-5" /></button>
            <div className="font-display text-lg font-semibold text-primary">
              {NAV.find((n) => (n.exact ? path === n.to : path === n.to || path.startsWith(n.to + "/")))?.label ?? "Admin"}
            </div>
            <div className="text-sm text-muted-foreground hidden sm:block">{session.user.email}</div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
