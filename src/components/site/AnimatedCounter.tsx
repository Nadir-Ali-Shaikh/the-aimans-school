import { useEffect, useState, useRef, useMemo } from "react";

export function AnimatedCounter({ value, duration = 1500 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Parse target number, prefix, suffix, and commas
  const parsed = useMemo(() => {
    // Extract all digits
    const digits = value.replace(/[^0-9]/g, "");
    const target = parseInt(digits, 10) || 0;
    
    // Check suffixes
    const isPercent = value.includes("%");
    const isPlus = value.includes("+");
    const hasCommas = value.includes(",");
    
    return { target, isPercent, isPlus, hasCommas };
  }, [value]);

  useEffect(() => {
    if (hasAnimated || parsed.target === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasAnimated(true);
          let startTimestamp: number | null = null;
          
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function: easeOutQuad (starts fast, slows down at the end)
            const easeProgress = progress * (2 - progress);
            
            setCount(Math.floor(easeProgress * parsed.target));
            
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(parsed.target);
            }
          };
          
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" } // trigger slightly before entering fully
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [parsed.target, duration, hasAnimated]);

  // Format the display value
  const displayValue = useMemo(() => {
    if (!hasAnimated) return value;
    
    let formatted = count.toString();
    if (parsed.hasCommas) {
      formatted = count.toLocaleString();
    }
    if (parsed.isPlus) {
      formatted += "+";
    }
    if (parsed.isPercent) {
      formatted += "%";
    }
    return formatted;
  }, [count, hasAnimated, parsed, value]);

  return (
    <div ref={elementRef} className="inline-block transition-all duration-300">
      {displayValue}
    </div>
  );
}
