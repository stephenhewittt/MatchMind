import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import CountUp from "../components/CountUp";
import Reveal from "../components/Reveal";
import { AgentOrb, EmptyState, LiveDot, SectionTitle } from "../components/ui";
import { useStore } from "../lib/store";

const LOOP = ["Profile", "AI agent", "Agent matching", "Human meeting", "Feedback", "Smarter agent"];

export default function Learning() {
  const navigate = useNavigate();
  const store = useStore();
  const { profile, insights, matches } = store;

  if (!profile) {
    return (
      <Layout>
        <EmptyState icon="↻" title="Nothing to learn from yet" sub="Create your agent and the learning loop starts spinning."
          action={<button onClick={() => navigate("/onboarding")} className="btn-gold">Create your agent</button>} />
      </Layout>
    );
  }

  const pending = insights.filter((i) => i.status === "pending");
  const resolved = insights.filter((i) => i.status !== "pending");
  const rated = matches.filter((m) => m.feedback);
  const approved = insights.filter((i) => i.status === "approved").length;

  return (
    <Layout>
      <SectionTitle
        kicker="Learning Loop"
        title={`How ${profile.agentName} gets smarter`}
        sub="Every interaction — interviews, match decisions, calls, meetups, feedback — can refine your profile. Nothing changes without your approval."
      />

      {/* Loop visualization (LIGHT) */}
      <div className="section-light card-light mb-8 p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">The closed loop</div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
            <LiveDot /> Always on
          </span>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max items-center gap-2">
            {LOOP.map((step, i) => (
              <Reveal key={step} delay={i * 90}>
                <div className="flex items-center gap-2">
                  <div className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
                    i === LOOP.length - 1 ? "border-bronze/50 bg-gradient-to-br from-gold-300/40 to-bronze/15 text-bronze" : "border-stone-300 bg-white/70 text-stone-700"
                  }`}>
                    {step}
                  </div>
                  <span className="text-bronze">→</span>
                </div>
              </Reveal>
            ))}
            <div className="rounded-xl border border-bronze/50 bg-gradient-to-br from-gold-300/40 to-bronze/15 px-4 py-2.5 text-sm font-semibold text-bronze">Better matches</div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-6 border-t border-stone-200 pt-6">
          {[
            { label: "Insights approved", value: approved },
            { label: "Matches rated", value: rated.length },
            { label: "Awaiting review", value: pending.length },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="text-center sm:text-left">
                <div className="font-display text-4xl font-bold gold-text-warm">
                  <CountUp end={s.value} />
                </div>
                <div className="mt-1 text-sm text-stone-600">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Pending insights */}
      <h3 className="mb-4 font-display text-xl font-semibold text-zinc-100">
        Proposed learning updates
        {pending.length > 0 && <span className="ml-2 text-sm font-normal text-gold-400">{pending.length} awaiting review</span>}
      </h3>

      {pending.length === 0 ? (
        <div className="card mb-8 p-8 text-center">
          <div className="mb-3 flex justify-center"><AgentOrb size="h-10 w-10" /></div>
          <p className="text-sm text-zinc-500">
            No pending updates. Rate matches, take the interview, or complete calls — {profile.agentName} will draft
            profile refinements for your review.
          </p>
        </div>
      ) : (
        <div className="mb-8 space-y-3">
          {pending.map((ins, i) => (
            <Reveal key={ins.id} delay={i * 70}>
              <div className="card border-gold-600/30 p-5 transition-transform hover:-translate-y-0.5">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gold-500">via {ins.source}</div>
                <p className="text-base leading-relaxed text-zinc-200">{ins.text}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => store.setInsightStatus(ins.id, "approved")} className="btn-gold px-4 py-1.5 text-xs">Approve</button>
                  <button onClick={() => store.setInsightStatus(ins.id, "private")} className="btn-ghost px-4 py-1.5 text-xs">Keep private</button>
                  <button onClick={() => store.setInsightStatus(ins.id, "dismissed")} className="px-4 py-1.5 text-xs text-zinc-500 hover:text-rose-400">Dismiss</button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* Sources of learning (LIGHT) */}
      <div className="section-light card-light mb-8 p-6 sm:p-8">
        <h3 className="mb-1 font-display text-2xl font-bold text-stone-900">Where your brain learns</h3>
        <p className="mb-6 text-base text-stone-600">Every signal is a proposal you control — approve, keep private, or delete.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "✎", title: "Virtual interviews", text: "Deep follow-up questions refine your agent's model of you.", done: profile.interviewDone },
            { icon: "★", title: "Match feedback", text: `${rated.length} match${rated.length === 1 ? "" : "es"} rated so far — each rating tunes future rounds.`, done: rated.length > 0 },
            { icon: "◷", title: "Video calls", text: "With everyone's consent, call chemistry can inform future matching.", done: matches.some((m) => m.callScheduled) },
            { icon: "⌘", title: "Group calls", text: "For teams and friend groups — learn which group dynamics click.", done: false },
            { icon: "◉", title: "In-person meetups", text: "Post-meetup check-ins confirm whether matches felt accurate in real life.", done: false },
            { icon: "🛡", title: "Always consent-first", text: "Every insight is a proposal. Approve, edit, keep private, or delete.", done: true },
          ].map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 90}>
              <div className="card-light-hover h-full rounded-2xl border border-stone-200 bg-white/70 p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-300/40 to-bronze/20 text-lg text-bronze">{s.icon}</span>
                  {s.done && <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><LiveDot /> active</span>}
                </div>
                <h4 className="mt-3 font-display text-lg font-semibold text-stone-900">{s.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* History */}
      {resolved.length > 0 && (
        <>
          <h3 className="mb-4 font-display text-xl font-semibold text-zinc-100">Decision history</h3>
          <div className="card divide-y divide-ink-700/60">
            {resolved.map((ins) => (
              <div key={ins.id} className="flex items-center justify-between gap-4 p-4">
                <p className="text-sm text-zinc-400">{ins.text}</p>
                <span className={`shrink-0 text-xs font-medium ${
                  ins.status === "approved" ? "text-gold-400" : ins.status === "private" ? "text-sky-400" : "text-zinc-600"
                }`}>
                  {ins.status === "approved" ? "✓ Approved" : ins.status === "private" ? "◇ Private" : "− Dismissed"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
