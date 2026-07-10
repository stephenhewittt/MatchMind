import { CANDIDATES } from "./data";
import type {
  AgentMessage,
  Candidate,
  DimensionScore,
  Match,
  MatchIntent,
  ProfileFact,
  UserProfile,
} from "./types";
import { INTENT_META, TIER_META } from "./types";

/** Facts the agent may reveal in a first agent-to-agent conversation. */
function shareableFacts(profile: UserProfile): ProfileFact[] {
  return profile.facts.filter((f) => f.tier === "immediate");
}

function factValues(profile: UserProfile, category: string): string[] {
  return profile.facts
    .filter((f) => f.category === category)
    .flatMap((f) => f.value.split(",").map((s) => s.trim().toLowerCase()))
    .filter(Boolean);
}

function overlap(a: string[], b: string[]): string[] {
  const setB = new Set(b.map((s) => s.toLowerCase()));
  return a.filter((s) => setB.has(s.toLowerCase()));
}

function pctOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 50;
  const hits = overlap(a, b).length;
  return Math.round((hits / Math.min(a.length, b.length)) * 100);
}

/** Deterministic pseudo-random from a string seed, so scores are stable per pair. */
function seeded(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const clamp = (n: number, lo = 0, hi = 100) => Math.round(Math.max(lo, Math.min(hi, n)));

export interface ScoredCandidate {
  candidate: Candidate;
  intent: MatchIntent;
  score: number;
  dimensions: DimensionScore[];
  shared: string[];
  dealbreakerHit: boolean;
}

export function scoreCandidate(profile: UserProfile, candidate: Candidate, intent: MatchIntent): ScoredCandidate {
  const myInterests = factValues(profile, "interests");
  const myValues = factValues(profile, "values");
  const myGoals = factValues(profile, "goals");
  const myLifestyle = factValues(profile, "lifestyle");
  const myDealbreakers = factValues(profile, "dealbreakers");

  const candidateTraits = [...candidate.lifestyle, ...candidate.personality.toLowerCase().split(", ")];
  const dealbreakerHit = myDealbreakers.some((d) => candidateTraits.some((t) => t.includes(d)));

  const jitter = (key: string, spread = 14) => Math.round((seeded(profile.name + candidate.id + key) - 0.5) * spread);

  const interests = clamp(pctOverlap(myInterests, candidate.interests) * 0.7 + 30 + jitter("i"));
  const values = clamp(pctOverlap(myValues, candidate.values) * 0.65 + 32 + jitter("v"));
  const goals = clamp(pctOverlap(myGoals, candidate.goals) * 0.5 + 42 + jitter("g"));
  const lifestyle = clamp(pctOverlap(myLifestyle, candidate.lifestyle) * 0.6 + 34 + jitter("l"));
  const location = candidate.city.toLowerCase() === profile.city.trim().toLowerCase() ? 95 : 55;
  const timing = clamp(70 + jitter("t", 26));

  const weights: Record<MatchIntent, Record<string, number>> = {
    dating: { interests: 0.2, values: 0.3, goals: 0.2, lifestyle: 0.15, location: 0.1, timing: 0.05 },
    business: { interests: 0.15, values: 0.25, goals: 0.35, lifestyle: 0.05, location: 0.1, timing: 0.1 },
    friendship: { interests: 0.35, values: 0.25, goals: 0.05, lifestyle: 0.15, location: 0.15, timing: 0.05 },
    hobbies: { interests: 0.45, values: 0.1, goals: 0.1, lifestyle: 0.15, location: 0.15, timing: 0.05 },
    events: { interests: 0.3, values: 0.15, goals: 0.15, lifestyle: 0.1, location: 0.2, timing: 0.1 },
  };

  const w = weights[intent];
  const raw =
    interests * w.interests +
    values * w.values +
    goals * w.goals +
    lifestyle * w.lifestyle +
    location * w.location +
    timing * w.timing;

  const score = clamp(Math.round(dealbreakerHit ? raw * 0.55 : raw));

  const dimLabels: Record<MatchIntent, [string, string, string, string]> = {
    dating: ["Values alignment", "Lifestyle fit", "Long-term goals", "Shared interests"],
    business: ["Goal alignment", "Working values", "Domain overlap", "Timing"],
    friendship: ["Shared interests", "Values alignment", "Lifestyle fit", "Proximity"],
    hobbies: ["Activity overlap", "Skill & pace fit", "Availability", "Proximity"],
    events: ["Scene overlap", "Network value", "Energy match", "Proximity"],
  };

  const [d1, d2, d3, d4] = dimLabels[intent];
  const dimensions: DimensionScore[] = [
    { label: d1, score: intent === "dating" || intent === "friendship" ? values : goals },
    { label: d2, score: intent === "business" ? values : lifestyle },
    { label: d3, score: intent === "dating" ? goals : intent === "hobbies" ? timing : interests },
    { label: d4, score: intent === "dating" ? interests : location },
  ];

  return {
    candidate,
    intent,
    score,
    dimensions,
    shared: overlap(myInterests, candidate.interests),
    dealbreakerHit,
  };
}

export function rankCandidates(profile: UserProfile): ScoredCandidate[] {
  const results: ScoredCandidate[] = [];
  for (const intent of profile.intents) {
    for (const c of CANDIDATES) {
      if (!c.intents.includes(intent)) continue;
      if (results.some((r) => r.candidate.id === c.id)) continue;
      results.push(scoreCandidate(profile, c, intent));
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

function pick<T>(arr: T[], seed: string): T {
  return arr[Math.floor(seeded(seed) * arr.length)];
}

/**
 * Generates the simulated agent-to-agent conversation. Only facts labeled
 * "Share Immediately" are voiced; everything else is referenced obliquely
 * ("something on my side lines up with that") to demonstrate staged privacy.
 */
export function buildTranscript(profile: UserProfile, scored: ScoredCandidate): AgentMessage[] {
  const { candidate, intent, shared } = scored;
  const you = profile.agentName;
  const them = candidate.agentName;
  const openFacts = shareableFacts(profile);
  const intro = openFacts.find((f) => f.category === "interests")?.value ?? "a few interesting things";
  const sharedLine = shared.length
    ? shared.slice(0, 3).join(", ")
    : "complementary interests";

  const toneOpeners: Record<UserProfile["agentTone"], string> = {
    warm: `Hi ${them} — I represent someone in ${profile.city} exploring ${INTENT_META[intent].label.toLowerCase()} connections. May I ask a few questions?`,
    direct: `${them}, I'll be efficient: my principal is looking for ${INTENT_META[intent].label.toLowerCase()} matches in ${profile.city}. Shall we compare notes?`,
    playful: `Hey ${them}! My human is great and I have receipts. Yours seems interesting too — want to trade highlights?`,
    polished: `Good evening, ${them}. I represent a member seeking ${INTENT_META[intent].label.toLowerCase()} connections. I propose a brief compatibility exchange.`,
  };

  const qualifying: Record<MatchIntent, [string, string]> = {
    dating: [
      `How does ${candidate.name.split(" ")[0]} approach long-term commitment, and what pace feels right early on?`,
      `They value ${candidate.values.slice(0, 2).join(" and ")}, and they're looking for something real, not casual. Pace: unhurried but intentional. And your principal's non-negotiables?`,
    ],
    business: [
      `What stage is ${candidate.name.split(" ")[0]} at, and what kind of partner or deal are they actually seeking right now?`,
      `${candidate.professional}. Currently focused on: ${candidate.goals[0]}. They value ${candidate.values[0]} above all. What does your principal bring to the table?`,
    ],
    friendship: [
      `What does a great friendship look like for ${candidate.name.split(" ")[0]} — frequency, depth, activities?`,
      `Consistent but low-pressure. They love ${candidate.interests.slice(0, 2).join(" and ")}, and they show up when it matters. Your principal?`,
    ],
    hobbies: [
      `What's ${candidate.name.split(" ")[0]}'s current focus and skill level, and how often do they want to meet up?`,
      `Right now: ${candidate.goals[0]}. Typical rhythm is weekly or biweekly. They're ${candidate.lifestyle[0]}, which shapes scheduling. Yours?`,
    ],
    events: [
      `What scenes does ${candidate.name.split(" ")[0]} move in, and what kind of introductions are they open to?`,
      `They're active around ${candidate.interests.slice(0, 2).join(" and ")}, open to curated intros over cold ones. What rooms does your principal want to be in?`,
    ],
  };

  const [q, a] = qualifying[intent];
  const privacyBeat = pick(
    [
      `There are relevant details on my side I'm not cleared to share yet — but they're compatible with what you've described.`,
      `I hold a few medium-term facts that strengthen this match. I can confirm alignment without disclosing them.`,
      `Some of my principal's priorities are private for now. I can say they don't conflict with anything you've raised.`,
    ],
    profile.name + candidate.id + "privacy",
  );

  return [
    { from: "you", agent: you, text: toneOpeners[profile.agentTone] },
    { from: "them", agent: them, text: `Hello ${you}. Happy to talk. ${candidate.name.split(" ")[0]} is open to ${INTENT_META[intent].label.toLowerCase()} connections — headline: "${candidate.headline}." What can you share?` },
    { from: "you", agent: you, text: `Openly: interests include ${intro}. Based in ${profile.city || "the area"}. I'm seeing overlap around ${sharedLine}.` },
    { from: "you", agent: you, text: q },
    { from: "them", agent: them, text: a },
    { from: "you", agent: you, text: privacyBeat },
    { from: "them", agent: them, text: `Understood — same on my side. ${candidate.agentName}'s ledger shows no conflicts with your stated dealbreakers. I'd rate this exchange promising.` },
    { from: "you", agent: you, text: `Agreed. I'll recommend an introduction to my principal with a full compatibility report. Nothing proceeds unless both humans approve.` },
  ];
}

export function buildMatch(profile: UserProfile, scored: ScoredCandidate, now: number): Match {
  const { candidate, intent, score, dimensions, shared } = scored;
  const first = candidate.name.split(" ")[0];

  const signals: string[] = [];
  if (shared.length) signals.push(`You both list ${shared.slice(0, 3).join(", ")} — a natural first-meeting anchor.`);
  const sharedValues = overlap(factValues(profile, "values"), candidate.values);
  if (sharedValues.length) signals.push(`Shared core values: ${sharedValues.join(", ")}.`);
  if (candidate.city.toLowerCase() === profile.city.trim().toLowerCase())
    signals.push(`Same city (${candidate.city}) — easy logistics for meeting in person.`);
  if (candidate.verified) signals.push(`${first}'s identity is verified on MatchMind.`);
  signals.push(`Agent-to-agent exchange found no conflicts with your stated dealbreakers.`);

  const concerns: string[] = [];
  if (scored.dealbreakerHit) concerns.push(`One of ${first}'s traits may brush against a dealbreaker you listed — review carefully.`);
  if (candidate.city.toLowerCase() !== profile.city.trim().toLowerCase())
    concerns.push(`${first} is based in ${candidate.city} — factor in the distance.`);
  const low = dimensions.filter((d) => d.score < 55);
  for (const d of low.slice(0, 2)) concerns.push(`${d.label} scored lower (${d.score}) — worth exploring early.`);
  if (concerns.length === 0) concerns.push("No significant concerns surfaced. Timing preferences are the main open question.");

  const starterByIntent: Record<MatchIntent, string[]> = {
    dating: [
      shared[0] ? `Ask about their favorite ${shared[0]} memory — it's a shared passion.` : `Ask what a perfect Saturday looks like for them.`,
      `"Your agent says you value ${candidate.values[0]} — what shaped that?"`,
      `Trade the story behind your headlines. Theirs: "${candidate.headline}."`,
    ],
    business: [
      `Open with their current focus: ${candidate.goals[0]}.`,
      `Ask what they learned the hard way: ${first} is candid about past ventures.`,
      `Compare theses — your agent flagged strong goal alignment.`,
    ],
    friendship: [
      shared[0] ? `Suggest a low-key ${shared[0]} meetup — both agents rated it a natural fit.` : `Suggest coffee near ${candidate.city}.`,
      `Ask about "${candidate.headline.toLowerCase()}" — there's a story there.`,
      `You share ${sharedValues[0] ?? "similar values"}; conversations should run deep quickly.`,
    ],
    hobbies: [
      shared[0] ? `Propose a first ${shared[0]} session — keep it easy and gauge pace.` : `Ask what they're training toward right now.`,
      `Ask about their goal: ${candidate.goals[0]}.`,
      `Swap gear or route recommendations — instant common ground.`,
    ],
    events: [
      `Ask which rooms they want to be in this quarter.`,
      `Offer an intro from your own network first — ${first} responds to generosity.`,
      `Compare event calendars; both agents found overlapping scenes.`,
    ],
  };

  const nextSteps: Record<MatchIntent, string> = {
    dating: "Open a chat, then a 20-minute video call within the week while momentum is fresh.",
    business: "Open a chat and schedule a 30-minute video call to compare goals and timelines.",
    friendship: "Open a chat and suggest a casual meetup around a shared interest.",
    hobbies: "Open a chat and lock a first session — pace and schedule fit matter more than talk.",
    events: "Open a chat and pick one upcoming event to attend together.",
  };

  return {
    id: `m-${candidate.id}-${now}`,
    candidateId: candidate.id,
    intent,
    score,
    dimensions,
    shared,
    signals: signals.slice(0, 4),
    concerns: concerns.slice(0, 3),
    starters: starterByIntent[intent],
    nextStep: nextSteps[intent],
    transcript: buildTranscript(profile, scored),
    status: "new",
    chat: [],
    createdAt: now,
  };
}

/** Simulated reply from the matched human once a chat is open. */
export function candidateReply(candidate: Candidate, userText: string): string {
  const first = candidate.name.split(" ")[0];
  const lower = userText.toLowerCase();
  if (/\b(hi|hey|hello)\b/.test(lower))
    return `Hey! ${first} here. Our agents clearly did their homework — nice to finally talk to the actual human.`;
  if (lower.includes("?"))
    return `Great question. Honestly, ${candidate.interests[0]} has been my anchor lately — ${candidate.goals[0].toLowerCase()} is the big push this year. What about you?`;
  if (/(meet|coffee|call|drink|lunch)/.test(lower))
    return `I'd like that. I'm ${candidate.lifestyle[0]}, so mornings tend to work well — want to let the scheduler find us a slot?`;
  return `That resonates. My agent said we'd get along and I'm starting to see why. Tell me more about your side of it.`;
}

export function summarizeProfile(profile: UserProfile): string {
  const interests = factValues(profile, "interests").slice(0, 4);
  const values = factValues(profile, "values").slice(0, 3);
  const goals = factValues(profile, "goals").slice(0, 2);
  const intents = profile.intents.map((i) => INTENT_META[i].label.toLowerCase()).join(", ");
  const guarded = profile.facts.filter((f) => TIER_META[f.tier].rank >= 3).length;
  return [
    `${profile.name || "This member"}${profile.age ? `, ${profile.age}` : ""}${profile.city ? `, based in ${profile.city}` : ""} — seeking ${intents || "meaningful"} connections.`,
    interests.length ? `Leads with ${interests.join(", ")}.` : "",
    values.length ? `Core values: ${values.join(", ")}.` : "",
    goals.length ? `Working toward: ${goals.join("; ")}.` : "",
    `Their agent, ${profile.agentName}, speaks in a ${profile.agentTone} tone and guards ${guarded} sensitive ${guarded === 1 ? "detail" : "details"} behind trust-based disclosure.`,
  ]
    .filter(Boolean)
    .join(" ");
}
