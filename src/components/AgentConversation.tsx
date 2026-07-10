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

const TONE_CHIP: Record<"gold" | "emerald" | "sky", string> = {
  gold: "border-gold-500/40 bg-gold-500/10 text-gold-300",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  sky: "border-sky-500/40 bg-sky-500/10 text-sky-300",
};

function phaseOf(msg: AgentMessage, i: number): ConversationPhase {
  return msg.phase ?? PHASE_ORDER[i] ?? "acquaint";
}

/** Animated data beam connecting the two agents. */
function Beam({ sending }: { sending: "you" | "them" | null }) {
  return (
    <div className="relative mx-2 h-10 flex-1">
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-gold-600/20 via-gold-500/50 to-gold-600/20" />
      {/* traveling packets */}
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
    <div className="card relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

      {/* Header: the two agents + live beam */}
      <div className="border-b border-ink-700/60 p-5 sm:p-6">
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
          facts sealed. Here's the whole exchange — tap any step to see what it accomplished.
        </p>
      </div>

      {/* Transcript */}
      <div className="space-y-4 p-5 sm:p-6">
        {shown.map((msg, i) => {
          const isYou = msg.from === "you";
          const phase = phaseOf(msg, i);
          const meta = PHASE_META[phase];
          const isPrivacy = phase === "privacy";
          return (
            <div key={i} className={`flex animate-fade-up ${isYou ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[88%] sm:max-w-[80%] ${isYou ? "items-start" : "items-end"} flex flex-col`}>
                <div className={`mb-1.5 flex items-center gap-2 ${isYou ? "" : "flex-row-reverse"}`}>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONE_CHIP[meta.tone]}`}>
                    <span>{meta.icon}</span>
                    {meta.label}
                  </span>
                  <span className="text-[11px] text-zinc-500">{msg.agent}</span>
                </div>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isYou
                      ? "rounded-tl-sm border border-gold-600/30 bg-gold-500/10 text-zinc-100"
                      : "rounded-tr-sm border border-ink-600/70 bg-ink-700/70 text-zinc-200"
                  } ${isPrivacy ? "ring-1 ring-sky-500/40" : ""}`}
                >
                  {msg.text}
                  {isPrivacy && (
                    <div className="mt-2 flex items-center gap-1.5 border-t border-sky-500/20 pt-2 text-[11px] text-sky-300">
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
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 ${sending === "you" ? "border-gold-600/30 bg-gold-500/10" : "border-ink-600/70 bg-ink-700/70"}`}>
              <span className="text-[11px] text-zinc-500">{sending === "you" ? yourAgent : candidateAgent} is typing</span>
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Verdict footer */}
      {revealed >= msgs.length && (
        <div className="border-t border-ink-700/60 bg-gradient-to-r from-gold-500/5 to-transparent p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-gold-300">
              <span className="text-base">★</span> Both agents recommend an introduction
            </span>
            <span className="inline-flex items-center gap-2 text-emerald-300">
              🛡 Privacy preserved
            </span>
            <span className="text-zinc-500">Only “Share Immediately” facts were voiced · {msgs.length} messages exchanged</span>
          </div>
        </div>
      )}
    </div>
  );
}
