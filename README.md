# MatchMind

**Let your AI find your people.**

MatchMind is an AI-powered social matching platform. Instead of swiping, cold messaging, or guessing
compatibility, each user trains a personal AI agent that speaks with other users' agents — for
**dating, business, friendship, hobbies, and events** — and recommends an introduction only when
there's a meaningful reason to connect. Your AI agent does the awkward first conversation for you.

## Running it

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build
npm run preview   # serve the production build
```

Built with React 18 + TypeScript + Vite + Tailwind CSS. All state persists to `localStorage`;
the agent network is simulated by a deterministic client-side matching engine, so the entire
product experience runs with no backend or API keys.

## The product experience

1. **Landing** (`/`) — positioning, categories, how-it-works, privacy promise, tagline.
2. **Onboarding** (`/onboarding`) — six-step wizard:
   intent selection → basics + agent naming/tone → guided questions (interests, values,
   lifestyle, dealbreakers, goals, private notes) → enrichment (social linking + document
   uploads) → **privacy vault labeling** → private AI profile summary the user must approve
   before the agent activates.
3. **Agent Console** (`/app`) — agent status, staged matching rounds with a live activity feed,
   stats, and latest recommendations. Free plan is capped at 3 matches (freemium gate).
4. **Matches** (`/app/matches`) — filterable list; every card shows compatibility score and
   shared-interest chips.
5. **Match Report** (`/app/matches/:id`) — the "why": dimension bars, signals, honest concerns,
   conversation starters, recommended next step, and the full **agent-to-agent transcript**
   (only "Share Immediately" facts are ever voiced). Double-opt-in approval → mutual chat →
   video-call scheduling → post-match feedback.
6. **Virtual Interview** (`/app/interview`) — an AI interviewer with follow-up questions; every
   answer is filed to the vault as a *match-only* fact.
7. **Privacy Vault** (`/app/privacy`) — every fact the agent knows, its source, and its sharing
   rule, editable at any time. Five tiers: match-only, immediate, medium-term, long-term,
   ask-first. Full data deletion included.
8. **Learning Loop** (`/app/learning`) — feedback and match decisions generate proposed profile
   updates the user must approve, keep private, or dismiss. Closed loop:
   profile → agent → matching → meeting → feedback → smarter agent.
9. **Membership** (`/app/premium`, `/pricing`) — freemium tiers: Member (free), Premium ($29/mo),
   Concierge ($149/mo), plus enterprise/event matchmaking.

## Privacy model

Every piece of information the agent holds carries a disclosure tier. The matching engine uses
**all** facts to compute compatibility, but agent-to-agent conversations only voice facts labeled
*Share Immediately* — everything else is referenced without disclosure ("some of my principal's
priorities are private for now"). Core principle: *the agent knows enough to find the right
match, but only shares what you're ready to reveal.*

## Architecture

```
src/
  lib/
    types.ts     # domain model: intents, privacy tiers, facts, matches, insights
    data.ts      # seeded candidate network (simulated agent mesh)
    engine.ts    # compatibility scoring, transcript & report generation
    store.tsx    # React context + localStorage persistence + simulated agent runtime
  components/    # design system (gold-on-ink luxury theme) + app shell
  pages/         # landing, onboarding, console, matches, report, interview,
                 # vault, learning, pricing
```

The matching engine weights interest/value/goal/lifestyle overlap differently per intent
(dating weighs values and long-term goals; hobbies weighs activity overlap; business weighs
goal alignment), applies dealbreaker penalties, and is deterministic per user–candidate pair.
