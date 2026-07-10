import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { SectionTitle } from "../components/ui";
import { useStore } from "../lib/store";

const TIERS = [
  {
    name: "Member",
    price: "Free",
    period: "",
    tagline: "Meet your agent",
    features: [
      "Full profile creation & privacy vault",
      "Personal AI agent",
      "Up to 3 total matches",
      "Basic compatibility reports",
      "Virtual interview (one session)",
      "One match category",
    ],
    cta: "Current plan",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$29",
    period: "/month",
    tagline: "Let your agent off the leash",
    features: [
      "Unlimited agent conversations & matching rounds",
      "Deep compatibility reports with full transcripts",
      "All match categories simultaneously",
      "Advanced privacy controls & ask-first approvals",
      "Priority placement in the agent network",
      "Video call scheduling & post-call learning",
      "Enhanced agent training & tone tuning",
    ],
    cta: "Upgrade to Premium",
    highlight: true,
  },
  {
    name: "Concierge",
    price: "$149",
    period: "/month",
    tagline: "For serious networkers",
    features: [
      "Everything in Premium",
      "Business networking tier & investor matching",
      "Event matchmaking for conferences",
      "Pay-per-introduction credits included (10/mo)",
      "Human matchmaker review of top matches",
      "Early access to group dynamics matching",
    ],
    cta: "Contact us",
    highlight: false,
  },
];

export default function Pricing({ standalone = false }: { standalone?: boolean }) {
  const navigate = useNavigate();
  const store = useStore();
  const { profile } = store;

  const body = (
    <>
      <SectionTitle
        kicker="Membership"
        title="Choose how hard your agent works"
        sub="Free members meet their agent. Premium members let it search the entire network, every category, every night."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`card relative flex flex-col p-7 ${
              t.highlight ? "border-gold-500/60 shadow-gold-glow-lg" : ""
            }`}
          >
            {t.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-950">
                Most popular
              </div>
            )}
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">{t.name}</div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold text-zinc-100">{t.price}</span>
              <span className="text-sm text-zinc-500">{t.period}</span>
            </div>
            <p className="mt-1 text-sm italic text-zinc-500">{t.tagline}</p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-zinc-300">
                  <span className="text-gold-500">✓</span>
                  <span className="leading-snug">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                if (t.name === "Premium") {
                  if (profile) {
                    store.setPremium(true);
                    navigate("/app");
                  } else navigate("/onboarding");
                } else if (t.name === "Member" && !profile) {
                  navigate("/onboarding");
                }
              }}
              disabled={t.name === "Member" && !!profile && !profile.premium}
              className={`mt-7 w-full ${t.highlight ? "btn-gold" : "btn-ghost"}`}
            >
              {t.name === "Premium" && profile?.premium ? "✓ Active" : t.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="card mt-10 p-6">
        <h3 className="mb-2 font-display text-lg font-semibold text-zinc-200">Enterprise & Events</h3>
        <p className="text-sm leading-relaxed text-zinc-400">
          Conference networking, college communities, and organization-wide matching — sponsored communities and
          enterprise tiers give every attendee a temporary event agent that finds the ten people they should
          actually meet. <span className="text-gold-400">Contact sales for event matchmaking.</span>
        </p>
      </div>
    </>
  );

  if (standalone) {
    return (
      <div className="mx-auto min-h-screen max-w-6xl px-6 py-12">
        <button onClick={() => navigate("/")} className="mb-8 text-sm text-zinc-500 hover:text-gold-400">← Back</button>
        {body}
      </div>
    );
  }
  return <Layout>{body}</Layout>;
}
