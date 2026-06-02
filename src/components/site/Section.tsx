import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`mb-12 ${center ? "text-center mx-auto max-w-2xl" : "max-w-3xl"}`}>
      {eyebrow && (
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-3">{eyebrow}</div>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight">{title}</h2>
      {description && <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">{description}</p>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <section className="relative h-[44vh] min-h-[320px] flex items-end">
      <div className="absolute inset-0">
        <img src={image} alt="" className="w-full h-full object-cover" loading="eager" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/85 via-[#0B1F3A]/60 to-[#0B1F3A]/20" />
      </div>
      <div className="relative container-prose pb-12 text-white">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80 mb-3">{eyebrow}</div>
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight max-w-3xl">{title}</h1>
        <p className="mt-4 text-base md:text-lg text-white/90 max-w-2xl">{description}</p>
      </div>
    </section>
  );
}
