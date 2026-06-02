import { Link } from "@tanstack/react-router";
import { GraduationCap, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 text-foreground mt-24 shadow-2xl">
      <div className="container-prose py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 border border-white/20 text-white grid place-items-center shadow-[0_0_15px_rgba(255,255,255,0.15)]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-bold text-white">The Aiman's School</div>
              <div className="text-[10px] tracking-[0.2em] text-white/60 uppercase">Umerkot</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-foreground/70 leading-relaxed">
            Nurturing young minds with academic excellence, Islamic values and modern education since our founding.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a href="#" aria-label="Facebook" className="h-9 w-9 rounded-full grid place-items-center bg-white/10 hover:bg-white hover:text-[oklch(0.22_0.06_258)] hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-300"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="Instagram" className="h-9 w-9 rounded-full grid place-items-center bg-white/10 hover:bg-white hover:text-[oklch(0.22_0.06_258)] hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-300"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="h-9 w-9 rounded-full grid place-items-center bg-white/10 hover:bg-white hover:text-[oklch(0.22_0.06_258)] hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-300"><Youtube className="h-4 w-4" /></a>
            <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="h-9 w-9 rounded-full grid place-items-center bg-white/10 hover:bg-white hover:text-[oklch(0.22_0.06_258)] hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>
        </div>
 
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li><Link to="/about" className="hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-300">About Us</Link></li>
            <li><Link to="/academics" className="hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-300">Academics</Link></li>
            <li><Link to="/teachers" className="hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-300">Our Faculty</Link></li>
            <li><Link to="/facilities" className="hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-300">Facilities</Link></li>
            <li><Link to="/gallery" className="hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-300">Gallery</Link></li>
            <li><Link to="/blog" className="hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-300">News & Blog</Link></li>
          </ul>
        </div>
 
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li><Link to="/admissions" className="hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-300">Admissions</Link></li>
            <li><Link to="/results" className="hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-300">Result Portal</Link></li>
            <li><Link to="/contact" className="hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-300">Contact</Link></li>
            <li><a href="#" className="hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-300">Download Prospectus</a></li>
          </ul>
        </div>
 
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-foreground/80">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-white/80 flex-shrink-0" /><span>Main Campus, Umerkot, Sindh, Pakistan</span></li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-white/80 flex-shrink-0" /><span>+92 342 3299800</span></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 text-white/80 flex-shrink-0" /><span>info@aimansschool.edu.pk</span></li>
          </ul>
        </div>
      </div>
 
      <div className="border-t border-white/10">
        <div className="container-prose py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-foreground/60">
          <p>© {new Date().getFullYear()} The Aiman's School Umerkot. All rights reserved.</p>
          <p>Crafted with care for the next generation of leaders.</p>
        </div>
      </div>
    </footer>
  );
}
