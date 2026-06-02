import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/academics", label: "Academics" },
  { to: "/teachers", label: "Faculty" },
  { to: "/admissions", label: "Admissions" },
  { to: "/facilities", label: "Facilities" },
  { to: "/gallery", label: "Gallery" },
  { to: "/blog", label: "News" },
  { to: "/results", label: "Results" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [path]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-md shadow-elegant" : "bg-background"
      }`}
    >
      <div className="container-prose flex items-center justify-between h-16 md:h-20 text-foreground">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/5 border border-white/15 p-0.5 shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="The Aiman's School Logo" className="w-full h-full object-contain" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base md:text-lg font-bold">The Aiman's School</div>
            <div className="text-[10px] md:text-xs tracking-[0.2em] text-white/60 uppercase">Umerkot</div>
          </div>
        </Link>
 
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = path === l.to || (l.to !== "/" && path.startsWith(l.to));
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 relative ${
                  active ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] font-semibold" : "text-white/70 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                }`}
              >
                {l.label}
                {active && <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] rounded-full animate-pulse" />}
              </Link>
            );
          })}
          <Link
            to="/admissions"
            className="ml-3 inline-flex items-center px-4 py-2 rounded-md bg-white text-[oklch(0.22_0.06_258)] text-sm font-semibold shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:bg-white/95 hover:shadow-[0_0_20px_rgba(255,255,255,0.45)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            Apply Now
          </Link>
        </nav>
 
        <button
          aria-label="Toggle menu"
          className="lg:hidden p-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
 
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-background text-foreground">
          <div className="container-prose py-3 flex flex-col">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="py-2.5 text-sm font-medium border-b border-white/5 last:border-0 text-white/70 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/admissions"
              className="mt-3 inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-white text-[oklch(0.22_0.06_258)] text-sm font-semibold shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:bg-white/95 hover:shadow-[0_0_20px_rgba(255,255,255,0.45)] transition-all duration-300"
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
