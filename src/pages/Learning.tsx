import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { AgentOrb, EmptyState, SectionTitle } from "../components/ui";
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

  return (
    <Layout>
      <SectionTitle
        kicker="Learning Loop"
        title={`How ${profile.agentName} gets smarter`}
        sub="Every interaction — interviews, match decisions, calls, meetups, feedback — can refine your profile. Nothing changes without your approval."
      />

      {/* Loop visualization */}
      <div className="card mb-8 overflow-x-auto p-6">
        <div className="flex min-w-max items-center gap-2">
          {LOOP.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`rounded-xl border px-4 py-2.5 text-sm ${
                i === LOOP.length - 1 ? "border-gold-500/60 bg-gold-500/10 text-gold-300" : "border-ink-600 text-zinc-300"
              }`}>
                {step}
              </div>
              <span className="text-gold-600">→</span>
            </div>
          ))}
          <div className="rounded-xl border border-gold-500/60 bg-gold-500/10 px-4 py-2.5 text-sm text-gold-300">Better matches</div>
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
          {pending.map((ins) => (
            <div key={ins.id} className="card border-gold-600/30 p-5">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gold-500">via {ins.source}</div>
              <p className="text-sm leading-relaxed text-zinc-200">{ins.text}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => store.setInsightStatus(ins.id, "approved")} className="btn-gold px-4 py-1.5 text-xs">Approve</button>
                <button onClick={() => store.setInsightStatus(ins.id, "private")} className="btn-ghost px-4 py-1.5 text-xs">Keep private</button>
                <button onClick={() => store.setInsightStatus(ins.id, "dismissed")} className="px-4 py-1.5 text-xs text-zinc-500 hover:text-rose-400">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sources of learning */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: "✎", title: "Virtual interviews", text: "Deep follow-up questions refine your agent's model of you.", done: profile.interviewDone },
          { icon: "★", title: "Match feedback", text: `${rated.length} match${rated.length === 1 ? "" : "es"} rated so far — each rating tunes future rounds.`, done: rated.length > 0 },
          { icon: "◷", title: "Video calls", text: "With everyone's consent, call chemistry can inform future matching.", done: matches.some((m) => m.callScheduled) },
          { icon: "⌘", title: "Group calls", text: "For teams and friend groups — learn which group dynamics click.", done: false },
          { icon: "◉", title: "In-person meetups", text: "Post-meetup check-ins confirm whether matches felt accurate in real life.", done: false },
          { icon: "🛡", title: "Always consent-first", text: "Every insight is a proposal. Approve, edit, keep private, or delete.", done: true },
        ].map((s) => (
          <div key={s.title} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-lg text-gold-500">{s.icon}</span>
              {s.done && <span className="text-xs text-gold-400">✓ active</span>}
            </div>
            <h4 className="mt-2 text-sm font-medium text-zinc-200">{s.title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">{s.text}</p>
          </div>
        ))}
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
