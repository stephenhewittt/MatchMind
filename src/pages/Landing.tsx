import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { AgentOrb, Logo } from "../components/ui";
import { INTENT_META } from "../lib/types";
import type { MatchIntent } from "../lib/types";

const FEATURES = [
  { icon: "◈", title: "Personal AI Agent", text: "A private agent that understands your personality, goals, boundaries, and communication style — and searches on your behalf." },
  { icon: "⇄", title: "AI-to-AI Conversations", text: "Your agent handles the awkward first conversation, asking the qualifying questions you never could on a first date or cold call." },
  { icon: "🛡", title: "Privacy Vault", text: "Label every fact: match-only, share now, medium-term, long-term, or ask-first. Your agent knows everything, reveals only what you allow." },
  { icon: "★", title: "Compatibility Reports", text: "Every recommendation arrives with the why: shared values, signals, honest concerns, and conversation starters." },
  { icon: "✎", title: "Virtual Interview", text: "A thoughtful AI interviewer that asks follow-up questions to build a profile deeper than any form could." },
  { icon: "↻", title: "Continuous Learning", text: "Feedback from matches, calls, and meetups makes your agent smarter — and every insight needs your approval first." },
];

const STEPS = [
  { n: "01", title: "Train your agent", text: "Guided questions, a private AI interview, document uploads, and optional social links build a rich profile." },
  { n: "02", title: "Set your boundaries", text: "Decide exactly what your agent may use privately versus reveal — and when." },
  { n: "03", title: "Agents talk first", text: "Your agent interviews other agents, compares compatibility, and filters out the noise." },
  { n: "04", title: "Meet only the right people", text: "Both sides approve before any human contact. Chat, video call, or meet — your call." },
];

export default function Landing() {
  const navigate = useNavigate();
  const { profile } = useStore();

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-3">
          <button onClick={() => navigate("/pricing")} className="btn-ghost hidden text-sm sm:inline-flex">
            Membership
          </button>
          <button onClick={() => navigate(profile ? "/app" : "/onboarding")} className="btn-gold text-sm">
            {profile ? "Open console" : "Create your agent"}
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 text-center">
        <div className="animate-fade-up">
          <div className="mx-auto mb-8 flex justify-center">
            <AgentOrb active size="h-16 w-16" />
          </div>
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">
            Private by design · Intelligent by nature
          </div>
          <h1 className="mx-auto max-w-3xl font-display text-5xl font-semibold leading-tight text-zinc-100 sm:text-6xl">
            Let your AI <span className="gold-text">find your people.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Stop swiping, cold-messaging, and guessing. Your personal AI agent speaks with other agents first —
            for dating, business, friendship, hobbies, and events — and introduces you only when there's a
            meaningful reason to connect.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => navigate("/onboarding")} className="btn-gold px-8 py-3 text-base">
              Create your agent — free
            </button>
            <button onClick={() => navigate("/pricing")} className="btn-ghost px-8 py-3 text-base">
              See membership tiers
            </button>
          </div>
          <p className="mt-6 text-sm italic text-zinc-500">Your AI agent does the awkward first conversation for you.</p>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="hairline mb-14" />
        <h2 className="mb-8 text-center font-display text-3xl font-semibold text-zinc-100">
          One agent. <span className="gold-text">Every kind of connection.</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(Object.keys(INTENT_META) as MatchIntent[]).map((intent) => (
            <div key={intent} className="card card-hover p-5 text-center">
              <div className="mb-3 text-2xl text-gold-500">{INTENT_META[intent].icon}</div>
              <div className="mb-2 font-display text-lg font-semibold text-zinc-100">{INTENT_META[intent].label}</div>
              <p className="text-xs leading-relaxed text-zinc-500">{INTENT_META[intent].blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="hairline mb-14" />
        <h2 className="mb-10 text-center font-display text-3xl font-semibold text-zinc-100">How it works</h2>
        <div className="grid gap-6 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-6">
              <div className="mb-3 font-display text-3xl font-semibold text-gold-600/70">{s.n}</div>
              <h3 className="mb-2 font-medium text-zinc-100">{s.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="hairline mb-14" />
        <h2 className="mb-10 text-center font-display text-3xl font-semibold text-zinc-100">
          Built like a <span className="gold-text">luxury dashboard</span> for your social life
        </h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-lg text-gold-400">
                {f.icon}
              </div>
              <h3 className="mb-2 font-medium text-zinc-100">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy callout */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="card relative overflow-hidden p-10 text-center shadow-gold-glow-lg">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
          <div className="mb-4 text-3xl text-gold-500">🛡</div>
          <h2 className="font-display text-2xl font-semibold text-zinc-100">
            Your agent knows enough to find the right match —<br />
            <span className="gold-text">and shares only what you're ready to reveal.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
            Want children someday, but not on a first date? Raising a fund quietly? Your agent uses private facts to
            filter for true compatibility without ever revealing them before you're ready.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24 text-center">
        <h2 className="font-display text-4xl font-semibold text-zinc-100">
          The future of matching isn't swiping.
        </h2>
        <p className="mt-3 text-lg text-zinc-400">It's your agent finding the right people before you waste time on the wrong ones.</p>
        <button onClick={() => navigate("/onboarding")} className="btn-gold mt-8 px-10 py-3.5 text-base">
          Start free — train your agent tonight
        </button>
      </section>

      <footer className="border-t border-ink-700/60 py-10 text-center text-xs text-zinc-600">
        <Logo size="text-base" />
        <p className="mt-3">Smarter matches. Better conversations. Real connections.</p>
        <p className="mt-1">© 2026 MatchMind · Trust & Safety · Privacy Policy · Terms</p>
      </footer>
    </div>
  );
}
