import { useEffect, useRef, useState } from "react";

export interface JourneySection {
  id: string;
  label: string;
}

/**
 * A scroll-linked "neural pathway": a slim top progress bar plus a vertical
 * rail (desktop) whose gold line charges downward as you scroll, igniting a
 * node at each section. Clicking a node scrolls to that section.
 */
export default function ScrollJourney({ sections }: { sections: JourneySection[] }) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      const els = sections.map((s) => document.getElementById(s.id));
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? Math.min(1, Math.max(0, scrollY / docH)) : 0);
      const mid = scrollY + window.innerHeight * 0.4;
      let idx = 0;
      els.forEach((el, i) => {
        if (el && el.offsetTop <= mid) idx = i;
      });
      setActive(idx);
    };
    const onScroll = () => {
      if (reduce) return update();
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-0.5">
        <div
          className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 shadow-gold-glow"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Side neural rail */}
      <div className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
        <div className="relative" style={{ height: 300 }}>
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink-600/70" />
          <div
            className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-gold-500 to-gold-300"
            style={{ height: `${progress * 100}%`, boxShadow: "0 0 12px rgba(217,178,92,0.5)" }}
          />
          {sections.map((s, i) => {
            const top = (i / (sections.length - 1)) * 100;
            const lit = i <= active;
            const isActive = i === active;
            return (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className="group absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ top: `${top}%` }}
                aria-label={s.label}
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? "h-3.5 w-3.5 animate-pulse-gold bg-gold-300 shadow-gold-glow"
                      : lit
                        ? "h-2.5 w-2.5 bg-gold-500"
                        : "h-2 w-2 bg-ink-600 group-hover:bg-gold-600"
                  }`}
                />
                <span
                  className={`pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
                    isActive
                      ? "translate-x-0 text-gold-300 opacity-100"
                      : "-translate-x-1 text-zinc-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
