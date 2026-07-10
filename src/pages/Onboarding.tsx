import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chip, Logo, TierPill, TierSelect } from "../components/ui";
import { AGENT_NAMES, DEALBREAKER_POOL, INTEREST_POOL, LIFESTYLE_POOL, VALUE_POOL } from "../lib/data";
import { summarizeProfile } from "../lib/engine";
import { uid, useStore } from "../lib/store";
import { INTENT_META, TIER_META } from "../lib/types";
import type { FactCategory, MatchIntent, PrivacyTier, ProfileFact, UserProfile } from "../lib/types";

const STEPS = ["Intent", "Basics", "Guided Questions", "Enrich", "Privacy Vault", "Agent Summary"] as const;

const SOCIALS = ["LinkedIn", "Instagram", "X", "TikTok", "YouTube", "GitHub", "Substack", "Personal website"];
const DOC_TYPES = ["Resume", "Portfolio", "Pitch deck", "Company summary", "LinkedIn export", "Project examples"];

function defaultTier(category: FactCategory): PrivacyTier {
  switch (category) {
    case "interests":
    case "basics":
      return "immediate";
    case "values":
    case "lifestyle":
    case "professional":
      return "medium";
    case "goals":
      return "long-term";
    case "dealbreakers":
      return "match-only";
    case "sensitive":
      return "ask-first";
  }
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveProfile } = useStore();

  const [step, setStep] = useState(0);
  const [intents, setIntents] = useState<MatchIntent[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [headline, setHeadline] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [dealbreakers, setDealbreakers] = useState<string[]>([]);
  const [goals, setGoals] = useState("");
  const [sensitive, setSensitive] = useState("");
  const [professional, setProfessional] = useState("");
  const [linked, setLinked] = useState<string[]>([]);
  const [docs, setDocs] = useState<string[]>([]);
  const [agentName, setAgentName] = useState(AGENT_NAMES[0]);
  const [agentTone, setAgentTone] = useState<UserProfile["agentTone"]>("warm");
  const [facts, setFacts] = useState<ProfileFact[]>([]);

  const toggle = <T,>(list: T[], set: (v: T[]) => void, item: T) =>
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const buildFacts = (): ProfileFact[] => {
    const out: ProfileFact[] = [];
    const add = (category: FactCategory, label: string, value: string, source: ProfileFact["source"] = "guided") => {
      if (value.trim()) out.push({ id: uid("f"), category, label, value: value.trim(), tier: defaultTier(category), source });
    };
    add("basics", "City", city);
    add("basics", "Headline", headline);
    add("interests", "Interests", interests.join(", "));
    add("values", "Core values", values.join(", "));
    add("lifestyle", "Lifestyle", lifestyle.join(", "));
    add("dealbreakers", "Dealbreakers", dealbreakers.join(", "));
    add("goals", "Life & match goals", goals);
    add("sensitive", "Sensitive details", sensitive);
    add("professional", "Professional background", professional);
    for (const d of docs) add("professional", d, `Uploaded ${d.toLowerCase()} parsed into profile`, "upload");
    for (const s of linked) add("basics", `${s} profile`, `Linked ${s} account (verified)`, "social");
    return out;
  };

  const draftProfile: UserProfile = useMemo(
    () => ({
      name, age, city, headline, intents, facts,
      agentName, agentTone,
      summary: "", summaryApproved: false, premium: false,
      linkedAccounts: linked, uploadedDocs: docs, interviewDone: false,
    }),
    [name, age, city, headline, intents, facts, agentName, agentTone, linked, docs],
  );

  const summary = useMemo(() => summarizeProfile(draftProfile), [draftProfile]);

  const canContinue = [
    intents.length > 0,
    name.trim().length > 0 && city.trim().length > 0,
    interests.length >= 2 && values.length >= 2,
    true,
    true,
    true,
  ][step];

  const next = () => {
    if (step === 2) setFacts(buildFacts());
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const finish = () => {
    saveProfile({ ...draftProfile, summary, summaryApproved: true });
    navigate("/app");
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
        <button onClick={() => navigate("/")}>
          <Logo size="text-xl" />
        </button>
        <span className="text-xs uppercase tracking-widest text-zinc-500">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-10 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1 rounded-full transition-all duration-500 ${i <= step ? "bg-gradient-to-r from-gold-600 to-gold-400" : "bg-ink-700"}`} />
            <div className={`mt-2 hidden text-[10px] uppercase tracking-wider sm:block ${i === step ? "text-gold-400" : "text-zinc-600"}`}>{label}</div>
          </div>
        ))}
      </div>

      <div className="animate-fade-up" key={step}>
        {step === 0 && (
          <>
            <h1 className="font-display text-3xl font-semibold text-zinc-100">What are you looking for?</h1>
            <p className="mt-2 text-sm text-zinc-500">Pick every category that applies — your agent matches across all of them.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {(Object.keys(INTENT_META) as MatchIntent[]).map((intent) => {
                const active = intents.includes(intent);
                return (
                  <button
                    key={intent}
                    onClick={() => toggle(intents, setIntents, intent)}
                    className={`card card-hover p-5 text-left transition-all ${active ? "border-gold-500/70 shadow-gold-glow" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xl ${active ? "text-gold-400" : "text-gold-600/60"}`}>{INTENT_META[intent].icon}</span>
                      <span className="font-display text-lg font-semibold text-zinc-100">{INTENT_META[intent].label}</span>
                      {active && <span className="ml-auto text-gold-400">✓</span>}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500">{INTENT_META[intent].blurb}</p>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="font-display text-3xl font-semibold text-zinc-100">The basics</h1>
            <p className="mt-2 text-sm text-zinc-500">Only your first name and city are ever shown before you approve a match.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-500">Name</label>
                <input className="input-dark" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-500">Age</label>
                <input className="input-dark" value={age} onChange={(e) => setAge(e.target.value)} placeholder="32" inputMode="numeric" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-500">City</label>
                <input className="input-dark" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Austin" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-500">Headline</label>
                <input className="input-dark" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Engineer who bakes bread and climbs rocks" />
              </div>
            </div>
            <div className="mt-8">
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-500">Name your agent</label>
              <div className="flex flex-wrap gap-2">
                {AGENT_NAMES.map((n) => (
                  <Chip key={n} active={agentName === n} onClick={() => setAgentName(n)}>{n}</Chip>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-500">Agent tone</label>
              <div className="flex flex-wrap gap-2">
                {(["warm", "direct", "playful", "polished"] as const).map((t) => (
                  <Chip key={t} active={agentTone === t} onClick={() => setAgentTone(t)}>{t}</Chip>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-display text-3xl font-semibold text-zinc-100">Guided questions</h1>
            <p className="mt-2 text-sm text-zinc-500">This trains your agent's model of you. Pick at least two interests and two values.</p>

            <div className="mt-8 space-y-8">
              <div>
                <h3 className="mb-3 text-sm font-medium text-gold-400">What do you love doing?</h3>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_POOL.map((i) => (
                    <Chip key={i} active={interests.includes(i)} onClick={() => toggle(interests, setInterests, i)}>{i}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-medium text-gold-400">What do you value most?</h3>
                <div className="flex flex-wrap gap-2">
                  {VALUE_POOL.map((v) => (
                    <Chip key={v} active={values.includes(v)} onClick={() => toggle(values, setValues, v)}>{v}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-medium text-gold-400">Your lifestyle</h3>
                <div className="flex flex-wrap gap-2">
                  {LIFESTYLE_POOL.map((l) => (
                    <Chip key={l} active={lifestyle.includes(l)} onClick={() => toggle(lifestyle, setLifestyle, l)}>{l}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-medium text-gold-400">Hard dealbreakers</h3>
                <div className="flex flex-wrap gap-2">
                  {DEALBREAKER_POOL.map((d) => (
                    <Chip key={d} active={dealbreakers.includes(d)} onClick={() => toggle(dealbreakers, setDealbreakers, d)}>{d}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-gold-400">Goals — what are you working toward?</h3>
                <textarea className="input-dark min-h-20" value={goals} onChange={(e) => setGoals(e.target.value)}
                  placeholder="long-term relationship, find a co-founder, run a marathon…" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium text-gold-400">Anything private your agent should know?</h3>
                <p className="mb-2 text-xs text-zinc-500">
                  E.g. "I want kids in ~5 years" or "I'm quietly job hunting." Used for matching, never revealed without your rules.
                </p>
                <textarea className="input-dark min-h-20" value={sensitive} onChange={(e) => setSensitive(e.target.value)}
                  placeholder="Your agent keeps this in the vault…" />
              </div>
              {intents.includes("business") && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gold-400">Professional background</h3>
                  <textarea className="input-dark min-h-20" value={professional} onChange={(e) => setProfessional(e.target.value)}
                    placeholder="Role, industry, stage, what you're looking for professionally…" />
                </div>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="font-display text-3xl font-semibold text-zinc-100">Enrich your profile</h1>
            <p className="mt-2 text-sm text-zinc-500">Optional — link accounts and upload documents so your agent represents the real you.</p>

            <div className="card mt-8 p-6">
              <h3 className="mb-1 font-medium text-zinc-200">Link social accounts</h3>
              <p className="mb-4 text-xs text-zinc-500">Adds authenticity verification and richer signals. You control what's shared.</p>
              <div className="flex flex-wrap gap-2">
                {SOCIALS.map((s) => (
                  <Chip key={s} active={linked.includes(s)} onClick={() => toggle(linked, setLinked, s)}>
                    {linked.includes(s) ? `✓ ${s}` : s}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="card mt-5 p-6">
              <h3 className="mb-1 font-medium text-zinc-200">Upload documents</h3>
              <p className="mb-4 text-xs text-zinc-500">
                For business and professional matching — your agent parses these privately.
              </p>
              <div className="flex flex-wrap gap-2">
                {DOC_TYPES.map((d) => (
                  <Chip key={d} active={docs.includes(d)} onClick={() => toggle(docs, setDocs, d)}>
                    {docs.includes(d) ? `✓ ${d}` : `↑ ${d}`}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="card mt-5 border-gold-600/30 p-6">
              <h3 className="mb-1 font-medium text-gold-300">✎ Virtual Interview</h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                The deepest way to train your agent: a private AI interview with thoughtful follow-up questions.
                Available from your console after setup.
              </p>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="font-display text-3xl font-semibold text-zinc-100">Your privacy vault</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Every fact your agent knows carries a sharing rule. Defaults are conservative — adjust them now or anytime.
            </p>

            <div className="card mt-6 divide-y divide-ink-700/70">
              {facts.map((f) => (
                <div key={f.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">{f.label}</span>
                      <TierPill tier={f.tier} />
                    </div>
                    <div className="mt-0.5 truncate text-xs text-zinc-500">{f.value}</div>
                  </div>
                  <TierSelect value={f.tier} onChange={(tier) => setFacts(facts.map((x) => (x.id === f.id ? { ...x, tier } : x)))} />
                </div>
              ))}
              {facts.length === 0 && <div className="p-6 text-sm text-zinc-500">No facts yet — go back and answer a few questions.</div>}
            </div>

            <div className="mt-4 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
              {(Object.keys(TIER_META) as PrivacyTier[]).map((t) => (
                <div key={t} className="flex items-start gap-2">
                  <TierPill tier={t} />
                  <span className="leading-snug">{TIER_META[t].description}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1 className="font-display text-3xl font-semibold text-zinc-100">Meet {agentName}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Here's the private profile summary your agent will work from. Approve it, or go back and edit anything.
            </p>
            <div className="card mt-8 border-gold-600/40 p-8 shadow-gold-glow">
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">Private agent summary</div>
              <p className="font-display text-xl leading-relaxed text-zinc-200">{summary}</p>
              <div className="hairline my-6" />
              <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                <span>◈ {facts.length} facts in vault</span>
                <span>🛡 {facts.filter((f) => TIER_META[f.tier].rank >= 3).length} guarded details</span>
                <span>⇄ Tone: {agentTone}</span>
                <span>★ {intents.map((i) => INTENT_META[i].label).join(" · ")}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-zinc-600">
              This summary is visible only to you. Your agent begins matching only after you approve. You can edit or delete it anytime.
            </p>
          </>
        )}
      </div>

      <div className="mt-12 flex items-center justify-between">
        <button onClick={() => (step === 0 ? navigate("/") : setStep(step - 1))} className="btn-ghost">
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={next} disabled={!canContinue} className="btn-gold">
            Continue →
          </button>
        ) : (
          <button onClick={finish} className="btn-gold px-8">
            Approve & activate {agentName} ◈
          </button>
        )}
      </div>
    </div>
  );
}
