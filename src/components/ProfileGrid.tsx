import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrainCanvas from "./BrainCanvas";
import PersonPortrait from "./PersonPortrait";
import Reveal from "./Reveal";
import { SHOWCASE } from "../lib/showcase";
import { INTENT_META } from "../lib/types";

function ProfileCard({ person, index }: { person: (typeof SHOWCASE)[number]; index: number }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);

  return (
    <Reveal delay={(index % 4) * 90}>
      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={() => navigate("/onboarding")}
        className="card card-hover group relative block w-full overflow-hidden p-0 text-left"
      >
        {/* Portrait / brain stage */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              hover ? "scale-105 opacity-15 blur-[2px]" : "scale-100 opacity-100"
            }`}
          >
            <PersonPortrait a={person.appearance} id={person.id} />
          </div>

          {/* Virtual brain reveal */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
              hover ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {hover && <BrainCanvas size={220} points={170} speed={1.1} interactive={false} />}
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="rounded-full border border-gold-600/40 bg-ink-950/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gold-300 backdrop-blur-sm">
                Virtual brain · {person.compat}% match
              </span>
            </div>
          </div>

          {/* Scanline sweep on hover */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className={`absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-gold-400/15 to-transparent transition-opacity duration-300 ${
                hover ? "animate-scanline opacity-100" : "opacity-0"
              }`}
            />
          </div>

          {/* Category badge */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-ink-600/70 bg-ink-950/70 px-2.5 py-1 text-[11px] text-gold-300 backdrop-blur-sm">
            <span>{INTENT_META[person.intent].icon}</span>
            <span>{INTENT_META[person.intent].label}</span>
          </div>
          {person.verified && (
            <div className="absolute right-3 top-3 rounded-full border border-gold-500/40 bg-gold-500/10 px-2 py-0.5 text-[10px] text-gold-300 backdrop-blur-sm">
              ✓ Verified
            </div>
          )}

          {/* Bottom fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink-900 to-transparent" />
        </div>

        {/* Caption */}
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-zinc-100">
              {person.name}, {person.age}
            </h3>
            <span className="text-xs text-zinc-500">{person.city}</span>
          </div>
          <div className="mt-0.5 text-xs font-medium text-gold-500/90">{person.role}</div>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-400">
            <span className="text-zinc-500">Looking for: </span>
            {person.lookingFor}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {person.tags.map((t) => (
              <span key={t} className="rounded-full bg-gold-500/10 px-2 py-0.5 text-[11px] text-gold-300/90">
                {t}
              </span>
            ))}
          </div>
        </div>
      </button>
    </Reveal>
  );
}

export default function ProfileGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {SHOWCASE.map((person, i) => (
        <ProfileCard key={person.id} person={person} index={i} />
      ))}
    </div>
  );
}
