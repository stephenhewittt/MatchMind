import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Variant = "up" | "down" | "left" | "right" | "scale";

const HIDDEN: Record<Variant, string> = {
  up: "translate-y-10",
  down: "-translate-y-10",
  left: "-translate-x-12",
  right: "translate-x-12",
  scale: "scale-90",
};

/** Fades + slides/scales content into view when it scrolls onscreen. */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  variant = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: Variant;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-x-0 translate-y-0 scale-100 opacity-100" : `${HIDDEN[variant]} opacity-0`
      } ${className}`}
    >
      {children}
    </div>
  );
}
