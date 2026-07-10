import type { FactCategory, MatchIntent } from "./types";

export interface InterviewQuestion {
  id: string;
  intent: MatchIntent | "universal";
  category: FactCategory;
  /** Short label used for the vault fact this answer produces. */
  factLabel: string;
  /** The interviewer's spoken prompt. */
  prompt: string;
  /** Talking points shown while the member answers. */
  hints: string[];
  /** Playful question — gets a lighter visual treatment. */
  fun?: boolean;
  /** Quick reflection tags the member can tap after answering. */
  chips: string[];
}

const UNIVERSAL: Record<string, InterviewQuestion> = {
  opener: {
    id: "u-opener",
    intent: "universal",
    category: "values",
    factLabel: "At their best",
    prompt: "Let's warm up. In one sentence — who are you when you're at your best?",
    hints: ["Say it like you'd tell a friend", "No résumé — just you", "First instinct is usually the truest"],
    fun: true,
    chips: ["ambitious", "easygoing", "curious", "warm", "driven", "playful"],
  },
  connection: {
    id: "u-connection",
    intent: "universal",
    category: "values",
    factLabel: "What connection feels like",
    prompt: "What does a genuinely great connection feel like to you in the first hour together?",
    hints: ["Energy, pace, the topics you drift toward", "What makes it click for you", "When do you feel most yourself?"],
    chips: ["easy banter", "deep talk", "shared humor", "calm", "high energy", "no small talk"],
  },
  boundary: {
    id: "u-boundary",
    intent: "universal",
    category: "sensitive",
    factLabel: "A boundary to protect",
    prompt: "Last one. What's a boundary you'd want your agent to protect for you early on?",
    hints: ["Something you don't share right away", "A dealbreaker worth guarding", "Your agent will honor this in every conversation"],
    chips: ["take it slow", "privacy first", "no pressure", "honesty always", "guard my time"],
  },
};

const BY_INTENT: Record<MatchIntent, InterviewQuestion[]> = {
  dating: [
    {
      id: "d-seeking",
      intent: "dating",
      category: "goals",
      factLabel: "What they want in dating",
      prompt: "In dating right now — what are you actually looking for, and what's a hard no?",
      hints: ["Serious, casual, or open to seeing?", "Name one real dealbreaker", "Be honest — your agent filters on this"],
      chips: ["long-term", "taking it slow", "marriage-minded", "no drama", "wants kids", "open to anything"],
    },
    {
      id: "d-greenflag",
      intent: "dating",
      category: "values",
      factLabel: "A green flag they love",
      prompt: "Give me a green flag you love — even one other people might find a little weird.",
      hints: ["The quirk that makes you lean in", "Specific beats generic", "Have fun with this one"],
      fun: true,
      chips: ["kind to strangers", "big laugh", "reads a lot", "great with family", "ambitious", "good texter"],
    },
  ],
  business: [
    {
      id: "b-building",
      intent: "business",
      category: "professional",
      factLabel: "What they're building & who they need",
      prompt: "What are you building or chasing right now — and who do you need next to you to get there?",
      hints: ["Stage, focus, the gap you're filling", "Co-founder, investor, mentor, client?", "What would a great partner unlock?"],
      chips: ["co-founder", "investors", "clients", "a mentor", "collaborators", "hiring"],
    },
    {
      id: "b-pitch",
      intent: "business",
      category: "professional",
      factLabel: "Fifteen-second pitch",
      prompt: "Pitch yourself in fifteen seconds. Ready? Go.",
      hints: ["Who you are + what you're great at", "The one thing you want remembered", "Confidence looks good on camera"],
      fun: true,
      chips: ["operator", "builder", "closer", "creative", "technical", "connector"],
    },
  ],
  friendship: [
    {
      id: "f-trust",
      intent: "friendship",
      category: "values",
      factLabel: "Ideal friendship",
      prompt: "What does a low-effort, high-trust friendship look like for you?",
      hints: ["How often do you actually want to connect?", "Depth vs. frequency", "What makes you feel close to someone?"],
      chips: ["ride or die", "low maintenance", "deep talks", "adventure buddy", "consistent", "no obligation"],
    },
    {
      id: "f-sunday",
      intent: "friendship",
      category: "lifestyle",
      factLabel: "Ideal Sunday with people",
      prompt: "Describe your ideal Sunday with people you actually like.",
      hints: ["Paint the scene — where, what, who", "Chill or full of plans?", "This tells your agent your rhythm"],
      fun: true,
      chips: ["slow morning", "big brunch", "outdoors", "game day", "quiet + cozy", "spontaneous"],
    },
  ],
  hobbies: [
    {
      id: "h-into",
      intent: "hobbies",
      category: "interests",
      factLabel: "What they're into & how deep",
      prompt: "What are you into right now — and how deep do you go? Casual or a little obsessive?",
      hints: ["The thing you'd talk about for an hour", "Beginner, weekend warrior, or all-in?", "Specific interests match better"],
      chips: ["running", "climbing", "gaming", "cooking", "cycling", "all-in"],
    },
    {
      id: "h-flex",
      intent: "hobbies",
      category: "interests",
      factLabel: "A niche flex",
      prompt: "Flex something — a niche skill, stat, or obsession you're weirdly proud of.",
      hints: ["The nerdier the better", "Bonus points if it's useless", "Make us smile"],
      fun: true,
      chips: ["a PR to brag about", "a rare skill", "an encyclopedic obsession", "a collection", "a hidden talent"],
    },
  ],
  events: [
    {
      id: "e-rooms",
      intent: "events",
      category: "goals",
      factLabel: "Rooms & people they want",
      prompt: "What rooms do you want to be in this year — and who do you want to meet in them?",
      hints: ["Conferences, meetups, nightlife, private dinners?", "The person who'd change your year", "Your agent curates the intros"],
      chips: ["founders", "creatives", "industry leaders", "local scene", "investors", "new friends"],
    },
    {
      id: "e-move",
      intent: "events",
      category: "lifestyle",
      factLabel: "Their move at events",
      prompt: "At a great event, what's your move — working the room, or one deep conversation in the corner?",
      hints: ["Be honest about your social style", "Neither is wrong — it helps us match you", "How do you like to be introduced?"],
      fun: true,
      chips: ["work the room", "one deep chat", "small groups", "host energy", "observer", "bring the vibe"],
    },
  ],
};

/**
 * Builds a tight, well-paced interview from the member's selected intents:
 * a fun opener, one substantive question per top intent, one fun question,
 * a universal depth question, and a boundary closer.
 */
export function selectQuestions(intents: MatchIntent[]): InterviewQuestion[] {
  const primary = intents[0];
  const list: InterviewQuestion[] = [UNIVERSAL.opener];

  intents.slice(0, 2).forEach((intent) => list.push(BY_INTENT[intent][0]));

  // Guarantee at least one playful, intent-specific question from the top intent.
  if (primary) list.push(BY_INTENT[primary][1]);

  list.push(UNIVERSAL.connection);
  list.push(UNIVERSAL.boundary);

  // De-dupe while preserving order, cap length.
  const seen = new Set<string>();
  return list.filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true))).slice(0, 6);
}
