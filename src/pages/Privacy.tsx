import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { EmptyState, SectionTitle, TierPill, TierSelect } from "../components/ui";
import { useStore } from "../lib/store";
import { TIER_META } from "../lib/types";
import type { PrivacyTier } from "../lib/types";

const SOURCE_LABEL: Record<string, string> = {
  guided: "Guided questions",
  interview: "Virtual interview",
  upload: "Document upload",
  social: "Linked account",
  feedback: "Learning loop",
};

export default function Privacy() {
  const navigate = useNavigate();
  const store = useStore();
  const { profile } = store;

  if (!profile) {
    return (
      <Layout>
        <EmptyState icon="🛡" title="Your vault is empty" sub="Create your agent and the facts it learns will be governed here."
          action={<button onClick={() => navigate("/onboarding")} className="btn-gold">Create your agent</button>} />
      </Layout>
    );
  }

  const tiers = Object.keys(TIER_META) as PrivacyTier[];
  const counts = tiers.map((t) => ({ tier: t, count: profile.facts.filter((f) => f.tier === t).length }));

  return (
    <Layout>
      <SectionTitle
        kicker="Privacy Vault"
        title="What your agent knows — and when it may speak"
        sub={`${profile.agentName} uses everything below to find compatibility, but only reveals each fact according to its rule. Change any rule, any time.`}
      />

      {/* Tier summary */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {counts.map(({ tier, count }) => (
          <div key={tier} className="card p-4 text-center">
            <div className="font-display text-2xl font-semibold text-zinc-100">{count}</div>
            <div className="mt-1.5 flex justify-center"><TierPill tier={tier} /></div>
          </div>
        ))}
      </div>

      <div className="card mb-6 border-gold-600/30 p-5">
        <p className="text-sm leading-relaxed text-zinc-400">
          <span className="font-medium text-gold-300">Core principle:</span> your agent should know enough to find the
          right match, but only share what you're ready to reveal. In agent-to-agent conversations, only{" "}
          <span className="text-emerald-300">Share Immediately</span> facts are ever voiced — everything else is used
          silently for compatibility filtering.
        </p>
      </div>

      {/* Fact ledger */}
      <div className="card divide-y divide-ink-700/60">
        {profile.facts.map((f) => (
          <div key={f.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-zinc-200">{f.label}</span>
                <TierPill tier={f.tier} />
                <span className="text-[10px] uppercase tracking-wider text-zinc-600">via {SOURCE_LABEL[f.source]}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{f.value}</p>
            </div>
            <TierSelect value={f.tier} onChange={(tier) => store.updateFactTier(f.id, tier)} />
          </div>
        ))}
        {profile.facts.length === 0 && (
          <div className="p-8 text-center text-sm text-zinc-500">
            No facts yet. Answer guided questions or take the virtual interview.
          </div>
        )}
      </div>

      {/* Tier legend */}
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {tiers.map((t) => (
          <div key={t} className="card flex items-start gap-3 p-4">
            <TierPill tier={t} />
            <div>
              <div className="text-sm font-medium text-zinc-200">{TIER_META[t].label}</div>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{TIER_META[t].description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between rounded-2xl border border-rose-900/40 bg-rose-950/20 p-5">
        <div>
          <div className="text-sm font-medium text-zinc-200">Delete everything</div>
          <p className="text-xs text-zinc-500">Erase your profile, vault, matches, and agent. This cannot be undone.</p>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Delete your MatchMind profile, vault, and all matches? This cannot be undone.")) {
              store.resetAll();
              navigate("/");
            }
          }}
          className="rounded-xl border border-rose-800/60 px-4 py-2 text-sm text-rose-300 transition-colors hover:bg-rose-950/40"
        >
          Delete all data
        </button>
      </div>
    </Layout>
  );
}
