import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { TIER_META } from "../lib/types";
import type { PrivacyTier } from "../lib/types";

/** Sleek gold neural-brain glyph used in the MatchMind wordmark. */
export function BrainMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mm-brain-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f3ddab" />
          <stop offset="0.5" stopColor="#d9b25c" />
          <stop offset="1" stopColor="#a8783f" />
        </linearGradient>
      </defs>
      {/* Brain silhouette (left profile) */}
      <path
        d="M24 9.5c-3-2.6-8.2-2-10.4 1.3-3.4-.6-6.3 2.4-5.6 5.8-2.8 1.7-2.9 6-.1 7.8-1.2 3.2 1.2 6.8 4.6 6.8.9 2.9 4.3 4.2 6.8 2.6 2.2 1.9 5.8 1 6.9-1.7"
        stroke="url(#mm-brain-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 9.5c3-2.6 8.2-2 10.4 1.3 3.4-.6 6.3 2.4 5.6 5.8 2.8 1.7 2.9 6 .1 7.8 1.2 3.2-1.2 6.8-4.6 6.8-.9 2.9-4.3 4.2-6.8 2.6-2.2 1.9-5.8 1-6.9-1.7"
        stroke="url(#mm-brain-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central fissure */}
      <path d="M24 9.5V33" stroke="url(#mm-brain-grad)" strokeWidth="2.4" strokeLinecap="round" />
      {/* Neural folds / circuits */}
      <path d="M24 15.5c-3 .3-4.5 2.4-3.9 5" stroke="url(#mm-brain-grad)" strokeWidth="1.7" strokeLinecap="round" opacity="0.85" />
      <path d="M24 19c3 .3 4.6 2.6 3.8 5.4" stroke="url(#mm-brain-grad)" strokeWidth="1.7" strokeLinecap="round" opacity="0.85" />
      {/* Synapse nodes */}
      <circle cx="14" cy="20.6" r="1.7" fill="url(#mm-brain-grad)" />
      <circle cx="20.1" cy="20.5" r="1.5" fill="url(#mm-brain-grad)" />
      <circle cx="27.8" cy="24.4" r="1.5" fill="url(#mm-brain-grad)" />
      <circle cx="33.6" cy="18.4" r="1.7" fill="url(#mm-brain-grad)" />
    </svg>
  );
}

export function Logo({ size = "text-3xl", withMark = true }: { size?: string; withMark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold tracking-wide ${size}`}>
      {withMark && <BrainMark className="h-[1.15em] w-[1.15em] shrink-0 drop-shadow-[0_0_8px_rgba(217,178,92,0.25)]" />}
      <span>
        <span className="text-zinc-100">Match</span>
        <span className="text-gold-400">Mind</span>
      </span>
    </span>
  );
}

export function SectionTitle({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      {kicker && <div className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">{kicker}</div>}
      <h2 className="font-display text-3xl font-semibold text-zinc-100">{title}</h2>
      {sub && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{sub}</p>}
    </div>
  );
}

export function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1c2233" strokeWidth="5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3ddab" />
            <stop offset="100%" stopColor="#c19a3f" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-lg font-semibold text-gold-400">{score}</span>
      </div>
    </div>
  );
}

export function Bar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-medium text-gold-400">{score}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-300 transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function Chip({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-90 ${
        active
          ? "scale-105 border-gold-500 bg-gold-500/15 text-gold-300 shadow-gold-glow"
          : "border-ink-600 bg-ink-850 text-zinc-400 hover:border-gold-600/50 hover:text-zinc-200"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      {children}
    </button>
  );
}

const TIER_STYLE: Record<PrivacyTier, string> = {
  "match-only": "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
  immediate: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  medium: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  "long-term": "border-gold-500/50 bg-gold-500/10 text-gold-300",
  "ask-first": "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

export function TierPill({ tier }: { tier: PrivacyTier }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${TIER_STYLE[tier]}`}>
      {TIER_META[tier].short}
    </span>
  );
}

export function TierSelect({ value, onChange }: { value: PrivacyTier; onChange: (t: PrivacyTier) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PrivacyTier)}
      className="rounded-lg border border-ink-600 bg-ink-850 px-2 py-1 text-xs text-zinc-300 outline-none focus:border-gold-600/70"
    >
      {(Object.keys(TIER_META) as PrivacyTier[]).map((t) => (
        <option key={t} value={t}>
          {TIER_META[t].label}
        </option>
      ))}
    </select>
  );
}

export function Avatar({ name, size = "h-12 w-12 text-lg" }: { name: string; size?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div
      className={`flex items-center justify-center rounded-full border border-gold-600/40 bg-gradient-to-br from-ink-700 to-ink-850 font-display font-semibold text-gold-400 ${size}`}
    >
      {initials}
    </div>
  );
}

export function AgentOrb({ active = false, size = "h-10 w-10" }: { active?: boolean; size?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-bronze ${size} ${
        active ? "animate-pulse-gold" : ""
      }`}
    >
      <div className="absolute inset-[3px] rounded-full bg-ink-900" />
      <div
        className={`relative h-2/5 w-2/5 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 ${active ? "animate-pulse" : ""}`}
      />
    </div>
  );
}

export function EmptyState({ icon, title, sub, action }: { icon: string; title: string; sub: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-8 py-16 text-center">
      <div className="mb-4 text-4xl text-gold-500/60">{icon}</div>
      <h3 className="font-display text-xl text-zinc-200">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-500">{sub}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Pulsing "live" dot with a ping halo. */
export function LiveDot({ tone = "emerald" }: { tone?: "emerald" | "gold" }) {
  const solid = tone === "gold" ? "bg-gold-400" : "bg-emerald-500";
  const halo = tone === "gold" ? "bg-gold-400" : "bg-emerald-400";
  return (
    <span className="relative flex h-2 w-2">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${halo} opacity-75`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${solid}`} />
    </span>
  );
}

/** A meter bar that grows from 0 to its target on mount. Works on light or dark. */
export function GrowBar({
  pct,
  delay = 150,
  light = false,
  active = true,
}: {
  pct: number;
  delay?: number;
  light?: boolean;
  active?: boolean;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  const track = light ? "bg-stone-200" : "bg-ink-700";
  const fill = active ? "bg-gradient-to-r from-bronze via-gold-500 to-gold-300" : light ? "bg-stone-300" : "bg-ink-600";
  return (
    <div className={`h-2 overflow-hidden rounded-full ${track}`}>
      <div className={`h-full rounded-full transition-[width] duration-1000 ease-out ${fill}`} style={{ width: `${w}%` }} />
    </div>
  );
}

export function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-typing rounded-full bg-gold-500"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}
