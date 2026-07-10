import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import BrainCanvas from "../components/BrainCanvas";
import CountUp from "../components/CountUp";
import Reveal from "../components/Reveal";
import { AgentOrb, Avatar, Bar, EmptyState, GrowBar, LiveDot, ScoreRing, SectionTitle } from "../components/ui";
import { useStore } from "../lib/store";
import { INTENT_META, TIER_META } from "../lib/types";
import type { MatchIntent } from "../lib/types";

function timeAgo(at: number): string {
  const s = Math.floor((Date.now() - at) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/** Live-demand figures (simulated network). */
const DEMAND: { intent: MatchIntent; count: number }[] = [
  { intent: "dating", count: 12480 },
  { intent: "friendship", count: 9840 },
  { intent: "business", count: 8630 },
  { intent: "hobbies", count: 7320 },
  { intent: "events", count: 5170 },
];
const DEMAND_MAX = Math.max(...DEMAND.map((d) => d.count));

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

  type Move = { icon: string; title: string; desc: string; cta: string; onClick: () => void };
  const moves: Move[] = [];
  if (!profile.interviewDone)
    moves.push({ icon: "✎", title: "Take the virtual interview", desc: "The single biggest jump in match quality — wire deeper connections.", cta: "Start", onClick: () => navigate("/app/interview") });
  if (newMatches.length)
    moves.push({ icon: "★", title: `Review ${newMatches.length} new report${newMatches.length === 1 ? "" : "s"}`, desc: "Fresh introductions are waiting for your approval.", cta: "Review", onClick: () => navigate("/app/matches") });
  if (insights.some((i) => i.status === "pending"))
    moves.push({ icon: "↻", title: "Approve learning updates", desc: "Keep your brain evolving with your latest feedback.", cta: "Open", onClick: () => navigate("/app/learning") });
  if (!agentRunning && !atFreeLimit && matches.length === 0)
    moves.push({ icon: "◈", title: "Start your first matching round", desc: `${profile.agentName} will scan the network and bring back reports.`, cta: "Run", onClick: store.runAgent });
  if (atFreeLimit)
    moves.push({ icon: "♛", title: "Upgrade to Premium", desc: "Unlock unlimited rounds, every category, and video scheduling.", cta: "Upgrade", onClick: () => navigate("/app/premium") });
  moves.push({ icon: "🛡", title: "Tune your privacy vault", desc: "Decide exactly what your agent shares — and when.", cta: "Manage", onClick: () => navigate("/app/privacy") });
  const topMoves = moves.slice(0, 3);

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
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-semibold text-zinc-100">{profile.agentName}</span>
              {agentRunning && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold-300">
                  <LiveDot tone="gold" /> Working
                </span>
              )}
            </div>
            <p className="mt-1 text-base text-zinc-400">
              {agentRunning
                ? "In conversation with candidate agents — sharing only what you've approved."
                : matches.length
                  ? `Standing by. ${newMatches.length} report${newMatches.length === 1 ? "" : "s"} awaiting your review.`
                  : "Trained and ready. Start a matching round to search the agent network."}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-500">
              <span>◈ {profile.facts.length} facts learned</span>
              <span>🛡 {guarded} guarded details</span>
              <span>⇄ Tone: {profile.agentTone}</span>
              {profile.interviewDone && <span className="text-gold-500">✓ Interview complete</span>}
            </div>
            {agentRunning && (
              <div className="mt-4 h-1 w-full rounded-full bg-[length:200%_100%] animate-shimmer bg-gradient-to-r from-ink-700 via-gold-500/70 to-ink-700" />
            )}
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
                <CountUp end={neural} suffix="%" duration={1400} />
              </span>
            </div>
          </div>
          <div className="w-full flex-1">
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">Virtual brain</div>
            <h3 className="font-display text-2xl font-semibold text-zinc-100">
              Your neural profile is <span className="animate-gradient">{neural}%</span> formed
            </h3>
            <p className="mt-1 text-base text-zinc-500">{neuralHint}</p>
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

      {/* Network at a glance (LIGHT premium band) */}
      <div className="section-light card-light mb-8 overflow-hidden p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Your network at a glance</div>
            <h3 className="font-display text-2xl font-bold text-stone-900">Minds moving around you</h3>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
            <LiveDot /> Live
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[
            { label: "Matches found", value: matches.length, icon: "★" },
            { label: "Mutual connections", value: mutual.length, icon: "♛" },
            { label: "Agents you can reach", value: candidates.length * 214, icon: "⇄" },
            { label: "Learning updates", value: approvedInsights, icon: "↻" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div>
                <div className="text-lg text-bronze">{s.icon}</div>
                <div className="mt-1 font-display text-4xl font-bold gold-text-warm">
                  <CountUp end={s.value} />
                </div>
                <div className="mt-1 text-sm text-stone-600">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 border-t border-stone-200 pt-6">
          <div className="mb-4 text-sm font-medium text-stone-700">Live demand by category</div>
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {DEMAND.map((d, i) => {
              const active = profile.intents.includes(d.intent);
              return (
                <div key={d.intent} className="flex items-center gap-3">
                  <span className={`w-6 text-center text-lg ${active ? "text-bronze" : "text-stone-400"}`}>
                    {INTENT_META[d.intent].icon}
                  </span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className={active ? "font-medium text-stone-800" : "text-stone-500"}>
                        {INTENT_META[d.intent].label}
                        {active && <span className="ml-2 text-xs text-bronze">you</span>}
                      </span>
                      <span className="tabular-nums text-stone-500">
                        <CountUp end={d.count} /> seeking
                      </span>
                    </div>
                    <GrowBar pct={(d.count / DEMAND_MAX) * 100} active={active} delay={200 + i * 120} light />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommended next moves (LIGHT premium band) */}
      <div className="section-light card-light mb-8 p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Recommended next moves</span>
          <LiveDot tone="gold" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {topMoves.map((m, i) => (
            <Reveal key={m.title} delay={i * 90}>
              <button
                onClick={m.onClick}
                className="card-light-hover group flex h-full w-full flex-col rounded-2xl border border-stone-200 bg-white/70 p-5 text-left"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-300/40 to-bronze/20 text-lg text-bronze">
                  {m.icon}
                </div>
                <h4 className="font-display text-lg font-semibold text-stone-900">{m.title}</h4>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-stone-600">{m.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-bronze transition-transform group-hover:translate-x-1">
                  {m.cta} →
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Latest matches */}
        <div className="lg:col-span-3">
          <h3 className="mb-4 font-display text-xl font-semibold text-zinc-100">Latest recommendations</h3>
          {matches.length === 0 ? (
            <div className="card p-8 text-center text-base text-zinc-500">
              No matches yet. {profile.agentName} is ready when you are — start a matching round above.
            </div>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 4).map((m, i) => {
                const c = candidates.find((x) => x.id === m.candidateId)!;
                return (
                  <Reveal key={m.id} delay={i * 80}>
                    <button
                      onClick={() => navigate(`/app/matches/${m.id}`)}
                      className="card card-hover flex w-full items-center gap-4 p-4 text-left transition-transform hover:-translate-y-0.5"
                    >
                      <Avatar name={c.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-zinc-100">{c.name}</span>
                          <span className="text-[10px] uppercase tracking-wider text-gold-500">{INTENT_META[m.intent].label}</span>
                          {m.status === "mutual" && <span className="text-[10px] font-semibold text-emerald-400">● MUTUAL</span>}
                          {m.status === "new" && <span className="text-[10px] font-semibold text-gold-400">● NEW</span>}
                        </div>
                        <div className="truncate text-sm text-zinc-500">{c.headline}</div>
                      </div>
                      <ScoreRing score={m.score} size={56} />
                    </button>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-zinc-100">
            Agent activity
            <LiveDot tone={agentRunning ? "gold" : "emerald"} />
          </h3>
          <div className="card max-h-[460px] overflow-y-auto p-2">
            {activity.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500">Activity from {profile.agentName} will appear here.</div>
            ) : (
              <ul className="divide-y divide-ink-700/50">
                {activity.map((a) => (
                  <li key={a.id} className="flex animate-fade-up gap-3 px-3 py-3 text-sm">
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
