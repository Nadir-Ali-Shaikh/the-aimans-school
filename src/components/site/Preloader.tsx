import { useEffect, useState } from "react";

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if user has already seen the intro animation in this session
    const hasSeenIntro = sessionStorage.getItem("aimans-preloader-seen");
    
    if (hasSeenIntro) {
      setVisible(false);
      return;
    }

    // Lock body scroll during preload
    document.body.style.overflow = "hidden";

    // Start fade out sequence at 1.0 seconds
    const fadeTimeout = setTimeout(() => {
      setFadeOut(true);
    }, 1000);

    // Completely remove preloader component at 1.5 seconds
    const removeTimeout = setTimeout(() => {
      setVisible(false);
      // Restore scrolling
      document.body.style.overflow = "";
      sessionStorage.setItem("aimans-preloader-seen", "true");
    }, 1500);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(removeTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B1F3A] transition-all duration-700 ease-in-out ${
        fadeOut ? "opacity-0 scale-[1.08] pointer-events-none blur-md" : "opacity-100"
      }`}
    >
      {/* Background elegant lighting glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="relative flex flex-col items-center justify-center max-w-sm px-6 text-center animate-preloader-intro">
        {/* Glowing aura ring behind logo */}
        <div className="absolute h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_60%)] filter blur-xl animate-pulse" />
        
        {/* School Logo */}
        <div className="relative mb-8 overflow-hidden rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_50px_rgba(255,255,255,0.05)]">
          <img
            src="/logo.png"
            alt="The Aiman's School Logo"
            className="w-48 h-48 object-contain drop-shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
            width={192}
            height={192}
          />
          {/* Golden sweep reflection line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-preloader-shine" />
        </div>

        {/* Brand tagline progress indicator */}
        <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden relative mb-4">
          <div className="absolute left-0 top-0 h-full bg-white rounded-full animate-preloader-bar" />
        </div>
        
        <span className="text-[10px] uppercase tracking-[0.35em] text-white/70 font-semibold animate-pulse">
          LEARN • LEAD • ACHIEVE
        </span>
      </div>
    </div>
  );
}
