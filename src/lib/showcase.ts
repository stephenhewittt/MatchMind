import type { MatchIntent } from "./types";

export interface Appearance {
  skin: [string, string];
  hair: string;
  hairStyle: "short" | "long" | "bun" | "buzz" | "curly" | "coily" | "wavy" | "bald";
  beard?: boolean;
  glasses?: boolean;
  clothing: string;
  bg: [string, string];
}

export interface ShowcasePerson {
  id: string;
  name: string;
  age: number;
  city: string;
  intent: MatchIntent;
  role: string;
  lookingFor: string;
  tags: string[];
  compat: number;
  verified: boolean;
  appearance: Appearance;
}

/**
 * Curated showcase profiles for the landing grid. Each person is rendered as a
 * stylized portrait that morphs into their "virtual brain" on hover.
 */
export const SHOWCASE: ShowcasePerson[] = [
  {
    id: "s1",
    name: "Elena",
    age: 31,
    city: "Austin",
    intent: "dating",
    role: "Product designer",
    lookingFor: "A partner who cooks, travels, and wants to build a real future — no games.",
    tags: ["cooking", "hiking", "honest"],
    compat: 94,
    verified: true,
    appearance: {
      skin: ["#f2c9a0", "#d89e6f"],
      hair: "#3a2418",
      hairStyle: "long",
      clothing: "#7a5a34",
      bg: ["#2a1e10", "#0d0a06"],
    },
  },
  {
    id: "s2",
    name: "Marcus",
    age: 34,
    city: "Austin",
    intent: "business",
    role: "Angel investor",
    lookingFor: "First-time founders in climate & health to back and mentor.",
    tags: ["startups", "climate", "direct"],
    compat: 91,
    verified: true,
    appearance: {
      skin: ["#e8b98f", "#c48a5a"],
      hair: "#1a1a1f",
      hairStyle: "short",
      beard: true,
      clothing: "#243044",
      bg: ["#101a2a", "#07080b"],
    },
  },
  {
    id: "s3",
    name: "Priya",
    age: 29,
    city: "Austin",
    intent: "hobbies",
    role: "ML engineer & marathoner",
    lookingFor: "A running crew training for the majors + weekend board-game nights.",
    tags: ["running", "sci-fi", "coffee"],
    compat: 88,
    verified: true,
    appearance: {
      skin: ["#d9a877", "#b07f4e"],
      hair: "#0f0d0c",
      hairStyle: "wavy",
      glasses: true,
      clothing: "#5a2f3a",
      bg: ["#2a1220", "#0a0608"],
    },
  },
  {
    id: "s4",
    name: "David",
    age: 42,
    city: "Houston",
    intent: "business",
    role: "Energy exec & mentor",
    lookingFor: "Founders to advise — and a foursome to finally break 80 with.",
    tags: ["golf", "energy", "reading"],
    compat: 86,
    verified: true,
    appearance: {
      skin: ["#8a5a3c", "#5f3c26"],
      hair: "#2b2b2b",
      hairStyle: "buzz",
      beard: true,
      clothing: "#2c3a2c",
      bg: ["#152012", "#080a07"],
    },
  },
  {
    id: "s5",
    name: "Sofia",
    age: 27,
    city: "Austin",
    intent: "friendship",
    role: "Indie game developer",
    lookingFor: "New-in-town creatives for game nights and slow coffee mornings.",
    tags: ["gaming", "art", "kind"],
    compat: 90,
    verified: true,
    appearance: {
      skin: ["#f5d6b8", "#dcae88"],
      hair: "#8a3d55",
      hairStyle: "bun",
      clothing: "#3a4a6a",
      bg: ["#141d33", "#08070c"],
    },
  },
  {
    id: "s6",
    name: "Jonah",
    age: 38,
    city: "Dallas",
    intent: "events",
    role: "Restaurateur",
    lookingFor: "Operating partners and the right rooms as we open three new spots.",
    tags: ["food", "wine", "jazz"],
    compat: 83,
    verified: false,
    appearance: {
      skin: ["#e3b085", "#bd8452"],
      hair: "#14100c",
      hairStyle: "curly",
      beard: true,
      clothing: "#4a3420",
      bg: ["#241a0f", "#0a0705"],
    },
  },
  {
    id: "s7",
    name: "Grace",
    age: 36,
    city: "Austin",
    intent: "business",
    role: "Health-AI founder",
    lookingFor: "A technical co-founder to build with — pre-seed by Q2.",
    tags: ["health tech", "yoga", "sharp"],
    compat: 92,
    verified: true,
    appearance: {
      skin: ["#f0d0ad", "#d3a577"],
      hair: "#1c1512",
      hairStyle: "long",
      clothing: "#3c3550",
      bg: ["#1c1730", "#08070c"],
    },
  },
  {
    id: "s8",
    name: "Ben",
    age: 45,
    city: "San Antonio",
    intent: "friendship",
    role: "Teacher & book-club host",
    lookingFor: "Curious people for hikes, history talks, and a growing book club.",
    tags: ["reading", "history", "hiking"],
    compat: 81,
    verified: true,
    appearance: {
      skin: ["#ecc09a", "#c9946a"],
      hair: "#6a6a6a",
      hairStyle: "short",
      glasses: true,
      clothing: "#3a4436",
      bg: ["#1a2016", "#080a07"],
    },
  },
];
