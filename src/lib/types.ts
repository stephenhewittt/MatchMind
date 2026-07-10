export type MatchIntent = "dating" | "business" | "friendship" | "hobbies" | "events";

export const INTENT_META: Record<MatchIntent, { label: string; icon: string; blurb: string }> = {
  dating: { label: "Dating", icon: "♥", blurb: "Relationship goals, values, lifestyle, and long-term compatibility." },
  business: { label: "Business", icon: "◆", blurb: "Founders, investors, mentors, collaborators, and professional partners." },
  friendship: { label: "Friendship", icon: "☾", blurb: "People who share your humor, values, interests, and neighborhood." },
  hobbies: { label: "Hobbies", icon: "✦", blurb: "Fitness partners, golf groups, gaming friends, book clubs, travel buddies." },
  events: { label: "Events", icon: "⌘", blurb: "Conference networking, private meetups, nightlife, and group introductions." },
};

/** Privacy tiers — every fact the agent knows carries one of these labels. */
export type PrivacyTier = "match-only" | "immediate" | "medium" | "long-term" | "ask-first";

export const TIER_META: Record<PrivacyTier, { label: string; short: string; description: string; rank: number }> = {
  "match-only": {
    label: "Use for Matching Only",
    short: "Match only",
    description: "Your agent uses this privately to find compatibility but never reveals it.",
    rank: 0,
  },
  immediate: {
    label: "Share Immediately",
    short: "Immediate",
    description: "Safe to share early — hobbies, city, career field, general interests.",
    rank: 1,
  },
  medium: {
    label: "Share Medium-Term",
    short: "Medium-term",
    description: "Shared only after mutual interest or strong compatibility is established.",
    rank: 2,
  },
  "long-term": {
    label: "Share Long-Term Only",
    short: "Long-term",
    description: "Sensitive details shared only after trust is built between both people.",
    rank: 3,
  },
  "ask-first": {
    label: "Never Share Without Approval",
    short: "Ask first",
    description: "Your agent must ask you before ever revealing this.",
    rank: 4,
  },
};

export type FactCategory = "basics" | "interests" | "values" | "goals" | "lifestyle" | "dealbreakers" | "sensitive" | "professional";

export interface ProfileFact {
  id: string;
  category: FactCategory;
  label: string;
  value: string;
  tier: PrivacyTier;
  source: "guided" | "interview" | "upload" | "social" | "feedback";
}

export interface UserProfile {
  name: string;
  age: string;
  city: string;
  headline: string;
  intents: MatchIntent[];
  facts: ProfileFact[];
  agentName: string;
  agentTone: "warm" | "direct" | "playful" | "polished";
  summary: string;
  summaryApproved: boolean;
  premium: boolean;
  linkedAccounts: string[];
  uploadedDocs: string[];
  interviewDone: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  age: number;
  city: string;
  headline: string;
  intents: MatchIntent[];
  agentName: string;
  interests: string[];
  values: string[];
  goals: string[];
  lifestyle: string[];
  dealbreakers: string[];
  professional: string;
  personality: string;
  verified: boolean;
  /** Facts this candidate's agent holds back until later tiers — used to demo staged disclosure. */
  privateNote: string;
}

export interface AgentMessage {
  from: "you" | "them";
  agent: string;
  text: string;
}

export interface DimensionScore {
  label: string;
  score: number; // 0-100
}

export type MatchStatus = "new" | "approved" | "declined" | "mutual";

export interface Match {
  id: string;
  candidateId: string;
  intent: MatchIntent;
  score: number;
  dimensions: DimensionScore[];
  shared: string[];
  signals: string[];
  concerns: string[];
  starters: string[];
  nextStep: string;
  transcript: AgentMessage[];
  status: MatchStatus;
  feedback?: string;
  chat: { from: "you" | "them"; text: string; at: number }[];
  callScheduled?: string;
  createdAt: number;
}

export interface Insight {
  id: string;
  text: string;
  source: string;
  status: "pending" | "approved" | "private" | "dismissed";
}

export interface ActivityEvent {
  id: string;
  at: number;
  icon: string;
  text: string;
}
