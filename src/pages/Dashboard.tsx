import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import BrainCanvas from "../components/BrainCanvas";
import { AgentOrb, Avatar, Bar, EmptyState, ScoreRing, SectionTitle } from "../components/ui";
import { useStore } from "../lib/store";
import { INTENT_META, TIER_META } from "../lib/types";

function timeAgo(at: number): string {
  const s = Math.floor((Date.now() - at) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const store = useStore();
  const { profile, matches, activity, agentRunning, candidates, insights, freeMatchLimit } = store;

  if (!profile) {
    return (
      <Layout>
        <EmptyState
          icon="◈"
          title="No agent yet"
          sub="Create your profile and train your personal AI agent — it takes about three minutes."
          action={<button onClick={() => navigate("/onboarding")} className="btn-gold">Create your agent</button>}
        />
      </Layout>
    );
  }

  const newMatches = matches.filter((m) => m.status === "new");
  const mutual = matches.filter((m) => m.status === "mutual");
  const guarded = profile.facts.filter((f) => TIER_META[f.tier].rank >= 3).length;
  const atFreeLimit = !profile.premium && matches.length >= freeMatchLimit;

  const approvedInsights = insights.filter((i) => i.status === "approved").length;
  const neural = Math.min(
    100,
    22 +
      Math.min(profile.facts.length * 4, 40) +
      (profile.interviewDone ? 16 : 0) +
      approvedInsights * 5 +
      Math.min(matches.filter((m) => m.feedback).length * 4, 12),
  );
  const neuralHint = !profile.interviewDone
    ? "Complete the virtual interview to wire deeper connections (+16%)."
    : insights.some((i) => i.status === "pending")
      ? "Review pending learning updates to keep your brain evolving."
      : "Rate matches and take calls — every interaction adds synapses.";

  return (
    <Layout>
      <SectionTitle
        kicker="Agent Console"
        title={`Good evening, ${profile.name.split(" ")[0] || "member"}.`}
        sub={`${profile.agentName} is representing you across ${profile.intents.map((i) => INTENT_META[i].label.toLowerCase()).join(", ")}.`}
      />

      {/* Agent status card */}
      <div className="card relative mb-6 overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <AgentOrb active={agentRunning} size="h-16 w-16" />
          <div className="flex-1">
            <div className="font-display text-2xl font-semibold text-zinc-100">{profile.agentName}</div>
            <p className="mt-1 text-sm text-zinc-400">
              {agentRunning
                ? "In conversation with candidate agents — sharing only what you've approved."
                : matches.length
                  ? `Standing by. ${newMatches.length} report${newMatches.length === 1 ? "" : "s"} awaiting your review.`
                  : "Trained and ready. Start a matching round to search the agent network."}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
              <span>◈ {profile.facts.length} facts learned</span>
              <span>🛡 {guarded} guarded details</span>
              <span>⇄ Tone: {profile.agentTone}</span>
              {profile.interviewDone && <span className="text-gold-500">✓ Interview complete</span>}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={store.runAgent} disabled={agentRunning || atFreeLimit} className="btn-gold">
              {agentRunning ? "Searching…" : "Start matching round"}
            </button>
            {atFreeLimit && (
              <button onClick={() => navigate("/app/premium")} className="text-center text-xs text-gold-400 hover:underline">
                Free limit reached — upgrade ♛
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Neural profile */}
      <div className="card relative mb-6 overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative shrink-0">
            <BrainCanvas size={170} points={190} speed={0.8} interactive={false} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-ink-950/70 px-2.5 py-1 font-display text-lg font-bold text-gold-300 backdrop-blur-sm">
                {neural}%
              </span>
            </div>
          </div>
          <div className="w-full flex-1">
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">Virtual brain</div>
            <h3 className="font-display text-xl font-semibold text-zinc-100">
              Your neural profile is {neural}% formed
            </h3>
            <p className="mt-1 text-sm text-zinc-500">{neuralHint}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Bar label="Identity neurons" score={Math.min(100, profile.facts.length * 8)} />
              <Bar label="Depth (interview)" score={profile.interviewDone ? 100 : 10} />
              <Bar label="Learned synapses" score={Math.min(100, approvedInsights * 25 + matches.filter((m) => m.feedback).length * 15)} />
            </div>
          </div>
          {!profile.interviewDone && (
            <button onClick={() => navigate("/app/interview")} className="btn-ghost shrink-0 text-sm">
              Deepen it →
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Matches found", value: matches.length, icon: "★" },
          { label: "Mutual connections", value: mutual.length, icon: "♛" },
          { label: "Agent network", value: candidates.length * 214, icon: "⇄" },
          { label: "Learning updates", value: insights.filter((i) => i.status === "approved").length, icon: "↻" },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <div className="text-xs text-gold-500/80">{s.icon}</div>
            <div className="mt-1 font-display text-3xl font-semibold text-zinc-100">{s.value.toLocaleString()}</div>
            <div className="mt-1 text-xs text-zinc-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Latest matches */}
        <div className="lg:col-span-3">
          <h3 className="mb-4 font-display text-xl font-semibold text-zinc-100">Latest recommendations</h3>
          {matches.length === 0 ? (
            <div className="card p-8 text-center text-sm text-zinc-500">
              No matches yet. {profile.agentName} is ready when you are — start a matching round above.
            </div>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 4).map((m) => {
                const c = candidates.find((x) => x.id === m.candidateId)!;
                return (
                  <button
                    key={m.id}
                    onClick={() => navigate(`/app/matches/${m.id}`)}
                    className="card card-hover flex w-full items-center gap-4 p-4 text-left"
                  >
                    <Avatar name={c.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-100">{c.name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-gold-500">{INTENT_META[m.intent].label}</span>
                        {m.status === "mutual" && <span className="text-[10px] font-semibold text-emerald-400">● MUTUAL</span>}
                        {m.status === "new" && <span className="text-[10px] font-semibold text-gold-400">● NEW</span>}
                      </div>
                      <div className="truncate text-xs text-zinc-500">{c.headline}</div>
                    </div>
                    <ScoreRing score={m.score} size={56} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 font-display text-xl font-semibold text-zinc-100">Agent activity</h3>
          <div className="card max-h-[420px] overflow-y-auto p-2">
            {activity.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500">Activity from {profile.agentName} will appear here.</div>
            ) : (
              <ul className="divide-y divide-ink-700/50">
                {activity.map((a) => (
                  <li key={a.id} className="flex gap-3 px-3 py-3 text-sm">
                    <span className="mt-0.5 text-gold-500/90">{a.icon}</span>
                    <div>
                      <p className="leading-snug text-zinc-300">{a.text}</p>
                      <span className="text-[11px] text-zinc-600">{timeAgo(a.at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
