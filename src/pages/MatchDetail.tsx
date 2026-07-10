import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import AgentConversation from "../components/AgentConversation";
import { AgentOrb, Avatar, Bar, EmptyState, ScoreRing } from "../components/ui";
import { useStore } from "../lib/store";
import { INTENT_META } from "../lib/types";

const FEEDBACK_OPTIONS = [
  "good", "not a fit", "too casual", "too professional",
  "strong chemistry", "aligned goals", "not aligned",
];

const CALL_SLOTS = ["Tomorrow 6:30 PM", "Thursday 12:15 PM", "Saturday 10:00 AM"];

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const { profile, matches, candidates } = store;
  const match = matches.find((m) => m.id === id);
  const candidate = match ? candidates.find((c) => c.id === match.candidateId) : undefined;

  const [chatInput, setChatInput] = useState("");
  const [showSlots, setShowSlots] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [match?.chat.length]);

  if (!match || !candidate || !profile) {
    return (
      <Layout>
        <EmptyState icon="★" title="Match not found" sub="It may have been cleared."
          action={<button onClick={() => navigate("/app/matches")} className="btn-ghost">Back to matches</button>} />
      </Layout>
    );
  }

  const first = candidate.name.split(" ")[0];

  const sendChat = () => {
    if (!chatInput.trim()) return;
    store.sendChat(match.id, chatInput.trim());
    setChatInput("");
  };

  return (
    <Layout>
      <button onClick={() => navigate("/app/matches")} className="mb-6 text-sm text-zinc-500 hover:text-gold-400">
        ← All matches
      </button>

      {/* Header */}
      <div className="card relative mb-6 overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar name={candidate.name} size="h-20 w-20 text-2xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-semibold text-zinc-100">{candidate.name}, {candidate.age}</h1>
              {candidate.verified && (
                <span className="rounded-full border border-gold-500/50 bg-gold-500/10 px-2 py-0.5 text-[11px] text-gold-300">✓ Verified</span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-400">{candidate.headline}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
              <span>◉ {candidate.city}</span>
              <span>{INTENT_META[match.intent].icon} {INTENT_META[match.intent].label} match</span>
              <span>⇄ Agent: {candidate.agentName}</span>
            </div>
          </div>
          <div className="text-center">
            <ScoreRing score={match.score} size={88} />
            <div className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">Compatibility</div>
          </div>
        </div>

        {match.status === "new" && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => store.setMatchStatus(match.id, "approved")} className="btn-gold">
              Approve introduction
            </button>
            <button onClick={() => store.setMatchStatus(match.id, "declined")} className="btn-ghost">
              Pass
            </button>
            <p className="w-full text-xs text-zinc-600">
              {first} only learns about this match if you approve — and you only connect if they approve too.
            </p>
          </div>
        )}
        {match.status === "approved" && (
          <p className="mt-6 text-sm text-sky-400">✓ You approved. Waiting for {first}'s side to confirm…</p>
        )}
        {match.status === "declined" && (
          <p className="mt-6 text-sm text-zinc-500">You passed on this introduction. {profile.agentName} took note.</p>
        )}
      </div>

      {/* Priority row: why this match + connect / schedule on top */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Why this match makes sense */}
        <div className="card p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-gold-400">Why this match makes sense</h3>
          <div className="space-y-3">
            {match.dimensions.map((d) => <Bar key={d.label} label={d.label} score={d.score} />)}
          </div>
          <div className="hairline my-5" />
          <ul className="space-y-2.5">
            {match.signals.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-zinc-300">
                <span className="text-gold-500">◆</span><span className="leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect + schedule */}
        <div className="space-y-6">
          {match.status === "mutual" ? (
            <div className="card flex flex-col p-0">
              <div className="flex items-center justify-between border-b border-ink-700/70 px-5 py-4">
                <h3 className="font-display text-lg font-semibold text-zinc-100">Private chat with {first}</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">● Mutual</span>
              </div>
              <div className="max-h-80 min-h-48 flex-1 space-y-3 overflow-y-auto p-5">
                {match.chat.length === 0 && (
                  <p className="text-center text-xs text-zinc-600">
                    The floor is yours. Try one of the conversation starters from the report.
                  </p>
                )}
                {match.chat.map((c, i) => (
                  <div key={i} className={`flex ${c.from === "you" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      c.from === "you" ? "rounded-br-sm bg-gold-500/15 text-zinc-100" : "rounded-bl-sm bg-ink-700 text-zinc-300"
                    }`}>
                      {c.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2 border-t border-ink-700/70 p-4">
                <input
                  className="input-dark flex-1"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder={`Message ${first}…`}
                />
                <button onClick={sendChat} className="btn-gold px-4">Send</button>
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <div className="mb-3 flex justify-center"><AgentOrb size="h-10 w-10" /></div>
              <p className="text-sm text-zinc-400">
                {match.status === "new"
                  ? "Approve the introduction to unlock a private chat and video scheduling."
                  : match.status === "approved"
                    ? `Chat unlocks the moment ${first} approves too.`
                    : "This introduction is closed."}
              </p>
            </div>
          )}

          {/* Video call scheduling */}
          {match.status === "mutual" && (
            <div className="card p-6">
              <h3 className="mb-2 font-display text-lg font-semibold text-zinc-200">◷ Schedule a video call</h3>
              {match.callScheduled ? (
                <div className="rounded-xl border border-gold-600/40 bg-gold-500/10 p-4 text-sm text-gold-300">
                  ✓ Call confirmed: {match.callScheduled}
                  <p className="mt-1 text-xs text-zinc-500">
                    With consent from both of you, {profile.agentName} can observe the call to learn conversation chemistry — always your choice.
                  </p>
                </div>
              ) : showSlots ? (
                <div className="space-y-2">
                  <p className="mb-2 text-xs text-zinc-500">Both agents compared calendars. Openings:</p>
                  {CALL_SLOTS.map((slot) => (
                    <button key={slot} onClick={() => store.scheduleCall(match.id, slot)}
                      className="btn-dark w-full justify-between text-sm">
                      <span>{slot}</span><span className="text-gold-400">Book →</span>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <p className="mb-4 text-xs text-zinc-500">A 20-minute first call is the fastest way to confirm chemistry.</p>
                  <button onClick={() => setShowSlots(true)} className="btn-ghost w-full">Find a time</button>
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Agent conversation (collapsed, enticing) */}
      <div className="mb-6">
        <AgentConversation match={match} yourAgent={profile.agentName} candidateAgent={candidate.agentName} />
      </div>

      {/* Secondary details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-3 font-display text-lg font-semibold text-zinc-200">Honest concerns</h3>
            <ul className="space-y-2.5">
              {match.concerns.map((c, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-zinc-400">
                  <span className="text-amber-glow/80">▲</span><span className="leading-snug">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="mb-3 font-display text-lg font-semibold text-zinc-200">Conversation starters</h3>
            <ul className="space-y-2.5">
              {match.starters.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-zinc-300">
                  <span className="text-gold-500">✎</span><span className="leading-snug">{s}</span>
                </li>
              ))}
            </ul>
            <div className="hairline my-4" />
            <p className="text-xs text-zinc-500"><span className="text-gold-500">Recommended next step:</span> {match.nextStep}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Feedback */}
          {(match.status === "mutual" || match.status === "declined") && (
            <div className="card p-6">
              <h3 className="mb-2 font-display text-lg font-semibold text-zinc-200">↻ Rate this match</h3>
              <p className="mb-4 text-xs text-zinc-500">
                Your feedback trains {profile.agentName}. Every learning update needs your approval before it changes your profile.
              </p>
              {match.feedback ? (
                <p className="text-sm text-gold-400">✓ Recorded: "{match.feedback}" — review the learning update in your Learning Loop.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_OPTIONS.map((f) => (
                    <button key={f} onClick={() => store.giveFeedback(match.id, f)}
                      className="rounded-full border border-ink-600 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-gold-500 hover:text-gold-300">
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Safety */}
          <div className="card p-5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">🛡 Trust & Safety</span>
              <button className="text-zinc-500 underline-offset-2 hover:text-rose-400 hover:underline"
                onClick={() => store.addActivity("🛡", `Report filed for review. Our safety team will follow up within 24 hours.`)}>
                Report or block {first}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
