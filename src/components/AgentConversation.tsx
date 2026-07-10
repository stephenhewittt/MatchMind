import { useEffect, useRef, useState } from "react";
import { AgentOrb, TypingDots } from "./ui";
import type { AgentMessage, ConversationPhase, Match } from "../lib/types";

const PHASE_ORDER: ConversationPhase[] = [
  "intro", "acquaint", "share", "qualify", "answer", "privacy", "verdict", "recommend",
];

const PHASE_META: Record<ConversationPhase, { label: string; icon: string; tone: "gold" | "emerald" | "sky" }> = {
  intro: { label: "Introduction", icon: "◈", tone: "gold" },
  acquaint: { label: "Getting acquainted", icon: "⇄", tone: "gold" },
  share: { label: "Sharing openly", icon: "○", tone: "emerald" },
  qualify: { label: "Qualifying question", icon: "?", tone: "gold" },
  answer: { label: "Answering", icon: "✦", tone: "gold" },
  privacy: { label: "Privacy guard", icon: "🛡", tone: "sky" },
  verdict: { label: "Compatibility check", icon: "★", tone: "gold" },
  recommend: { label: "Recommendation", icon: "✓", tone: "emerald" },
};

/** Phase chip styling for the light (white) transcript surface. */
const TONE_CHIP: Record<"gold" | "emerald" | "sky", string> = {
  gold: "border-bronze/30 bg-gold-500/15 text-bronze",
  emerald: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700",
  sky: "border-sky-600/30 bg-sky-500/10 text-sky-700",
};

function phaseOf(msg: AgentMessage, i: number): ConversationPhase {
  return msg.phase ?? PHASE_ORDER[i] ?? "acquaint";
}

/** Animated data beam connecting the two agents (stays on the dark header). */
function Beam({ sending }: { sending: "you" | "them" | null }) {
  return (
    <div className="relative mx-2 h-10 flex-1">
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-gold-600/20 via-gold-500/50 to-gold-600/20" />
      {[0, 0.63, 1.26].map((d, i) => (
        <span
          key={`f${i}`}
          className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 animate-beam rounded-full bg-gold-300"
          style={{ animationDelay: `${d}s`, boxShadow: "0 0 8px rgba(243,221,171,0.9)" }}
        />
      ))}
      {[0.3, 0.95].map((d, i) => (
        <span
          key={`b${i}`}
          className="absolute top-1/2 h-1 w-1 -translate-y-1/2 animate-beam-back rounded-full bg-gold-500/70"
          style={{ animationDelay: `${d}s` }}
        />
      ))}
      {sending && (
        <div className={`absolute top-0 text-[10px] font-medium uppercase tracking-wider text-gold-400 ${sending === "you" ? "left-0" : "right-0"}`}>
          {sending === "you" ? "sending →" : "← sending"}
        </div>
      )}
    </div>
  );
}

function AgentNode({ name, role, active, tone }: { name: string; role: string; active: boolean; tone: "you" | "them" }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div className="relative">
        <AgentOrb active={active} size="h-12 w-12" />
        {active && <span className="absolute -inset-1 animate-ping rounded-full border border-gold-400/40" />}
      </div>
      <div className="text-center">
        <div className={`text-sm font-semibold ${tone === "you" ? "text-gold-300" : "text-zinc-200"}`}>{name}</div>
        <div className="text-[10px] uppercase tracking-wider text-zinc-500">{role}</div>
      </div>
    </div>
  );
}

export default function AgentConversation({
  match,
  candidateAgent,
  yourAgent,
}: {
  match: Match;
  candidateAgent: string;
  yourAgent: string;
}) {
  const msgs = match.transcript;
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(msgs.length);
  const [typing, setTyping] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const replay = () => {
    clearTimers();
    setOpen(true);
    setRevealed(0);
    setTyping(true);
    let t = 0;
    for (let i = 0; i < msgs.length; i++) {
      const think = i === 0 ? 500 : 620;
      t += think;
      timers.current.push(setTimeout(() => setTyping(true), t - think));
      timers.current.push(
        setTimeout(() => {
          setRevealed(i + 1);
          setTyping(i + 1 < msgs.length);
        }, t),
      );
    }
    timers.current.push(setTimeout(() => setTyping(false), t + 200));
  };

  const sending = typing && revealed < msgs.length ? msgs[revealed].from : null;
  const shown = msgs.slice(0, revealed);

  return (
    <div className="card overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

      {/* Header: the two agents + live beam (always visible, animated) */}
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">Agent-to-agent conversation</div>
            <h3 className="mt-1 font-display text-xl font-bold text-zinc-100">How your agents met</h3>
          </div>
          <button onClick={replay} className="btn-ghost shrink-0 text-sm">▷ Replay</button>
        </div>

        <div className="flex items-center justify-between">
          <AgentNode name={yourAgent} role="Your agent" active={sending === "you"} tone="you" />
          <Beam sending={sending} />
          <AgentNode name={candidateAgent} role="Their agent" active={sending === "them"} tone="them" />
        </div>

        <p className="mt-5 text-sm leading-relaxed text-zinc-400">
          Before you spent a second, your agents compared notes, asked the qualifying questions, and kept your private
          facts sealed. Every step is labeled so it's easy to follow.
        </p>
      </div>

      {/* Dropdown toggle */}
      {open ? (
        <button
          onClick={() => setOpen(false)}
          className="flex w-full items-center justify-between border-t border-ink-700/60 px-5 py-3.5 text-sm text-zinc-300 transition-colors hover:bg-ink-800/60 sm:px-6"
          aria-expanded
        >
          <span className="flex items-center gap-2 font-medium">
            <span className="text-gold-500">💬</span>
            Hide the conversation
            <span className="text-xs font-normal text-zinc-500">· {msgs.length} messages</span>
          </span>
          <span className="text-gold-500 transition-transform duration-300 rotate-180">▾</span>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="group relative block w-full overflow-hidden border-t border-gold-600/40 px-5 py-4 text-left sm:px-6"
          aria-expanded={false}
        >
          {/* Always-on gold sheen to draw the eye */}
          <span className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-gold-500/[0.08] via-gold-400/20 to-gold-500/[0.08] bg-[length:200%_100%]" />
          <span className="relative flex items-center justify-between gap-3">
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 animate-pulse-gold items-center justify-center rounded-full bg-gold-500/15 text-gold-300">▷</span>
              <span>
                <span className="block font-display text-base font-semibold text-gold-200">Read the full conversation</span>
                <span className="block text-xs text-zinc-400">
                  See exactly how {yourAgent} &amp; {candidateAgent} found your match · {msgs.length} messages
                </span>
              </span>
            </span>
            <span className="flex items-center gap-2 text-sm font-medium text-gold-300">
              <span className="hidden sm:inline">Open</span>
              <span className="transition-transform duration-300 group-hover:translate-y-0.5">▾</span>
            </span>
          </span>
        </button>
      )}

      {/* Transcript (LIGHT / white for readability) */}
      {open && (
        <div className="section-light animate-fade-up p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-bronze">The exchange</span>
            <button
              onClick={replay}
              className="inline-flex items-center gap-1.5 rounded-xl border border-bronze/30 px-3 py-1.5 text-sm font-medium text-bronze transition-colors hover:bg-gold-500/10"
            >
              ▷ Replay
            </button>
          </div>

          <div className="space-y-5">
            {shown.map((msg, i) => {
              const isYou = msg.from === "you";
              const phase = phaseOf(msg, i);
              const meta = PHASE_META[phase];
              const isPrivacy = phase === "privacy";
              return (
                <div key={i} className={`flex animate-fade-up ${isYou ? "justify-start" : "justify-end"}`}>
                  <div className={`flex max-w-[92%] flex-col sm:max-w-[80%] ${isYou ? "items-start" : "items-end"}`}>
                    <div className={`mb-1.5 flex items-center gap-2 ${isYou ? "" : "flex-row-reverse"}`}>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TONE_CHIP[meta.tone]}`}>
                        <span>{meta.icon}</span>
                        {meta.label}
                      </span>
                      <span className="text-[11px] font-medium text-stone-500">{msg.agent}</span>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed text-stone-800 shadow-sm ${
                        isYou
                          ? "rounded-tl-sm border border-bronze/25 bg-gradient-to-br from-gold-300/30 to-white"
                          : "rounded-tr-sm border border-stone-200 bg-white"
                      } ${isPrivacy ? "ring-2 ring-sky-400/50" : ""}`}
                    >
                      {msg.text}
                      {isPrivacy && (
                        <div className="mt-2.5 flex items-center gap-1.5 border-t border-sky-500/25 pt-2 text-[12px] font-medium text-sky-700">
                          🛡 Your guarded facts stayed sealed — used silently, never voiced.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {typing && sending && (
              <div className={`flex ${sending === "you" ? "justify-start" : "justify-end"}`}>
                <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 shadow-sm ${sending === "you" ? "border-bronze/25 bg-gradient-to-br from-gold-300/30 to-white" : "border-stone-200 bg-white"}`}>
                  <span className="text-[12px] font-medium text-stone-500">{sending === "you" ? yourAgent : candidateAgent} is typing</span>
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Verdict */}
          {revealed >= msgs.length && (
            <div className="mt-6 rounded-2xl border border-bronze/20 bg-gradient-to-r from-gold-300/20 to-transparent p-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-2 font-semibold text-bronze">
                  <span className="text-base">★</span> Both agents recommend an introduction
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">🛡 Privacy preserved</span>
              </div>
              <p className="mt-1.5 text-xs text-stone-500">Only “Share Immediately” facts were voiced · {msgs.length} messages exchanged</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
