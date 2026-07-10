import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { AgentOrb, Logo } from "../components/ui";
import BrainCanvas from "../components/BrainCanvas";
import ProfileGrid from "../components/ProfileGrid";
import Reveal from "../components/Reveal";
import { INTENT_META } from "../lib/types";
import type { MatchIntent } from "../lib/types";

const FEATURES = [
  { icon: "◈", title: "Personal AI Agent", text: "A private agent that understands your personality, goals, boundaries, and communication style — and searches on your behalf." },
  { icon: "⇄", title: "AI-to-AI Conversations", text: "Your agent handles the awkward first conversation, asking the qualifying questions you never could on a first date or cold call." },
  { icon: "🛡", title: "Privacy Vault", text: "Label every fact: match-only, share now, medium-term, long-term, or ask-first. Your brain knows everything, reveals only what you allow." },
  { icon: "★", title: "Compatibility Reports", text: "Every recommendation arrives with the why: shared values, signals, honest concerns, and conversation starters." },
  { icon: "✎", title: "Virtual Interview", text: "A thoughtful AI interviewer that asks follow-up questions to wire connections no form could ever capture." },
  { icon: "↻", title: "Continuous Learning", text: "Feedback from matches, calls, and meetups strengthens your virtual brain — and every new synapse needs your approval first." },
];

const FORMATION = [
  { n: "01", title: "Seed", text: "Guided questions, uploads, and linked accounts lay down the first neurons: interests, values, goals, dealbreakers." },
  { n: "02", title: "Deepen", text: "A private AI interview wires the connections no form captures — how you think, what you protect, who gets you." },
  { n: "03", title: "Connect", text: "Your brain's agent speaks with thousands of others, comparing compatibility while your secrets stay sealed." },
  { n: "04", title: "Evolve", text: "Every match, call, and meetup feeds back in. Your virtual brain gets sharper — with your approval on every change." },
];

const CATEGORY_HOOKS: Record<MatchIntent, string> = {
  dating: "Skip 200 swipes. Your brain already knows who you'd love talking to at 1 a.m.",
  business: "Your next co-founder, investor, or client — pre-qualified before you ever take the call.",
  friendship: "The people who get your humor and show up — found by pattern, not by luck.",
  hobbies: "Running crews, golf groups, game nights — matched on pace, level, and schedule.",
  events: "Walk into any room already knowing the ten people you should meet.",
};

export default function Landing() {
  const navigate = useNavigate();
  const { profile } = useStore();

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-3">
          <button onClick={() => navigate("/pricing")} className="btn-ghost hidden text-sm sm:inline-flex">
            Membership
          </button>
          <button onClick={() => navigate(profile ? "/app" : "/onboarding")} className="btn-gold text-sm">
            {profile ? "Open console" : "Start building — free"}
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-10 pt-10 text-center">
        <div className="animate-fade-up">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-600/40 bg-gold-500/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" />
            The neural layer for human connection
          </div>
          <h1 className="mx-auto max-w-5xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-zinc-100 sm:text-6xl lg:text-7xl">
            We build a <span className="gold-text">virtual brain</span>
            <br className="hidden sm:block" /> that finds your people.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            MatchMind turns who you are — your values, goals, humor, and boundaries — into a private
            digital mind. Its agent speaks with other minds first, so you only ever meet people worth meeting.
            Dating. Business. Friendship. Hobbies. Events.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => navigate("/onboarding")} className="btn-gold px-8 py-3 text-base">
              Start building your brain — free
            </button>
            <button onClick={() => navigate("/pricing")} className="btn-ghost px-8 py-3 text-base">
              Explore membership
            </button>
          </div>
          <p className="mt-5 text-sm italic text-zinc-500">Your AI agent does the awkward first conversation for you.</p>
        </div>

        {/* Brain visual with floating telemetry */}
        <div className="relative mx-auto mt-6 flex max-w-3xl items-center justify-center">
          <BrainCanvas size={560} points={320} className="relative z-10" />
          <div className="absolute left-0 top-16 z-20 hidden animate-float md:block">
            <div className="card px-4 py-3 text-left shadow-gold-glow">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">Agents in conversation</div>
              <div className="font-display text-xl font-semibold text-gold-400">2,568</div>
            </div>
          </div>
          <div className="absolute right-0 top-8 z-20 hidden animate-float-slow md:block">
            <div className="card px-4 py-3 text-left shadow-gold-glow">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">Compatibility signal</div>
              <div className="font-display text-xl font-semibold text-gold-400">94.2%</div>
            </div>
          </div>
          <div className="absolute bottom-24 left-4 z-20 hidden animate-float-slow lg:block" style={{ animationDelay: "1.5s" }}>
            <div className="card px-4 py-3 text-left">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">Privacy vault</div>
              <div className="font-display text-sm font-medium text-emerald-300">🛡 Sealed · 7 guarded facts</div>
            </div>
          </div>
          <div className="absolute bottom-32 right-2 z-20 hidden animate-float lg:block" style={{ animationDelay: "0.8s" }}>
            <div className="card px-4 py-3 text-left">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">Introduction ready</div>
              <div className="font-display text-sm font-medium text-gold-300">★ Both minds aligned</div>
            </div>
          </div>
        </div>
      </section>

      {/* Formation timeline */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        <Reveal>
          <div className="hairline mb-14" />
          <div className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">Neural formation</div>
          <h2 className="mb-12 text-center font-display text-4xl font-bold tracking-tight text-zinc-100">
            How your virtual brain forms
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-4">
          {FORMATION.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="card card-hover relative h-full overflow-hidden p-6">
                <div className="absolute -right-3 -top-5 font-display text-7xl font-bold text-gold-500/10">{s.n}</div>
                <div className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">{s.n}</div>
                <h3 className="mb-2 font-display text-xl font-semibold text-zinc-100">{s.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Live profiles grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="hairline mb-14" />
          <div className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">Minds on the network</div>
          <h2 className="mb-3 text-center font-display text-4xl font-bold tracking-tight text-zinc-100">
            Real people. <span className="gold-text">Real intentions.</span>
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-sm text-zinc-500">
            Every member is a virtual brain your agent can talk to. Hover a profile to see the mind behind the face.
          </p>
        </Reveal>
        <ProfileGrid />
        <Reveal>
          <p className="mt-8 text-center text-sm text-zinc-500">
            <button onClick={() => navigate("/onboarding")} className="text-gold-400 hover:underline">
              Build your own brain
            </button>{" "}
            and your agent starts talking to theirs tonight.
          </p>
        </Reveal>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="hairline mb-14" />
          <h2 className="mb-3 text-center font-display text-4xl font-bold tracking-tight text-zinc-100">
            One brain. <span className="gold-text">Every kind of connection.</span>
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-sm text-zinc-500">
            The same virtual mind that finds your next relationship can find your next co-founder.
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(Object.keys(INTENT_META) as MatchIntent[]).map((intent, i) => (
            <Reveal key={intent} delay={i * 90}>
              <button
                onClick={() => navigate("/onboarding")}
                className="card card-hover group h-full w-full p-5 text-left"
              >
                <div className="mb-3 text-2xl text-gold-500 transition-transform duration-300 group-hover:scale-110">
                  {INTENT_META[intent].icon}
                </div>
                <div className="mb-2 font-display text-lg font-semibold text-zinc-100">{INTENT_META[intent].label}</div>
                <p className="text-xs leading-relaxed text-zinc-500">{CATEGORY_HOOKS[intent]}</p>
                <div className="mt-3 text-xs text-gold-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Match here →
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="hairline mb-14" />
          <h2 className="mb-12 text-center font-display text-4xl font-bold tracking-tight text-zinc-100">
            Deep intelligence. <span className="gold-text">Quiet confidence.</span>
          </h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 100}>
              <div className="card card-hover h-full p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-lg text-gold-400">
                  {f.icon}
                </div>
                <h3 className="mb-2 font-display font-semibold text-zinc-100">{f.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Privacy callout */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <Reveal>
          <div className="card relative overflow-hidden p-10 text-center shadow-gold-glow-lg">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
            <div className="mb-4 text-3xl text-gold-500">🛡</div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-100">
              Your brain knows everything.
              <br />
              <span className="gold-text">It shares only what you're ready to reveal.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
              Want children someday, but not on a first date? Raising a fund quietly? Your virtual brain uses
              private facts to filter for true compatibility without ever voicing them before you're ready.
            </p>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-28 text-center">
        <Reveal>
          <div className="mx-auto mb-6 flex justify-center">
            <AgentOrb active size="h-14 w-14" />
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
            The future of matching isn't swiping.
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            It's a mind that knows you, protecting you, searching for you — around the clock.
          </p>
          <button onClick={() => navigate("/onboarding")} className="btn-gold mt-9 px-10 py-3.5 text-base">
            Start building your brain tonight
          </button>
        </Reveal>
      </section>

      <footer className="border-t border-ink-700/60 py-10 text-center text-xs text-zinc-600">
        <Logo size="text-base" />
        <p className="mt-3">Smarter matches. Better conversations. Real connections.</p>
        <p className="mt-1">© 2026 MatchMind · Trust & Safety · Privacy Policy · Terms</p>
      </footer>
    </div>
  );
}
