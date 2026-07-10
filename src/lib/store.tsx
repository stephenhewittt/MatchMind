import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CANDIDATES } from "./data";
import { buildMatch, candidateReply, rankCandidates, summarizeProfile } from "./engine";
import type { ActivityEvent, Candidate, Insight, Match, ProfileFact, UserProfile } from "./types";

const STORAGE_KEY = "matchmind-state-v1";
const FREE_MATCH_LIMIT = 3;

export interface AppState {
  profile: UserProfile | null;
  matches: Match[];
  insights: Insight[];
  activity: ActivityEvent[];
  agentRunning: boolean;
}

const emptyState: AppState = {
  profile: null,
  matches: [],
  insights: [],
  activity: [],
  agentRunning: false,
};

interface StoreApi extends AppState {
  candidates: Candidate[];
  freeMatchLimit: number;
  saveProfile: (p: UserProfile) => void;
  updateFactTier: (factId: string, tier: ProfileFact["tier"]) => void;
  addFacts: (facts: ProfileFact[]) => void;
  runAgent: () => void;
  setMatchStatus: (matchId: string, status: Match["status"]) => void;
  sendChat: (matchId: string, text: string) => void;
  scheduleCall: (matchId: string, when: string) => void;
  giveFeedback: (matchId: string, feedback: string) => void;
  setInsightStatus: (id: string, status: Insight["status"]) => void;
  setPremium: (premium: boolean) => void;
  markInterviewDone: () => void;
  addActivity: (icon: string, text: string) => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreApi | null>(null);

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...emptyState, ...JSON.parse(raw), agentRunning: false };
  } catch {
    /* corrupted state falls back to empty */
  }
  return emptyState;
}

let idCounter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const { agentRunning: _running, ...persisted } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  }, [state]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const api = useMemo<StoreApi>(() => {
    const pushActivity = (icon: string, text: string) =>
      setState((s) => ({
        ...s,
        activity: [{ id: uid("a"), at: Date.now(), icon, text }, ...s.activity].slice(0, 60),
      }));

    const later = (ms: number, fn: () => void) => {
      timers.current.push(setTimeout(fn, ms));
    };

    return {
      ...state,
      candidates: CANDIDATES,
      freeMatchLimit: FREE_MATCH_LIMIT,

      saveProfile(p) {
        setState((s) => ({ ...s, profile: p }));
      },

      updateFactTier(factId, tier) {
        setState((s) =>
          s.profile
            ? {
                ...s,
                profile: {
                  ...s.profile,
                  facts: s.profile.facts.map((f) => (f.id === factId ? { ...f, tier } : f)),
                },
              }
            : s,
        );
      },

      addFacts(facts) {
        setState((s) =>
          s.profile ? { ...s, profile: { ...s.profile, facts: [...s.profile.facts, ...facts] } } : s,
        );
      },

      /** Kicks off a simulated agent matching round with staged activity events. */
      runAgent() {
        setState((s) => {
          if (!s.profile || s.agentRunning) return s;
          return { ...s, agentRunning: true };
        });

        setState((s) => {
          if (!s.profile) return s;
          const profile = s.profile;
          const agent = profile.agentName;
          const ranked = rankCandidates(profile).filter(
            (r) => !s.matches.some((m) => m.candidateId === r.candidate.id),
          );
          const cap = profile.premium ? 5 : Math.max(0, FREE_MATCH_LIMIT - s.matches.length);
          const picks = ranked.slice(0, Math.min(3, cap));

          later(400, () => pushActivity("◈", `${agent} woke up and scanned ${CANDIDATES.length * 214} agent profiles across your categories.`));
          later(1500, () => pushActivity("⇄", `${agent} opened conversations with ${Math.max(picks.length * 3, 6)} candidate agents.`));
          later(2800, () => pushActivity("🛡", `${agent} shared only "Immediate" facts. ${profile.facts.filter((f) => f.tier !== "immediate").length} details stayed private.`));

          picks.forEach((scored, i) => {
            later(3800 + i * 1400, () => {
              const match = buildMatch(profile, scored, Date.now());
              setState((s2) => ({ ...s2, matches: [match, ...s2.matches] }));
              pushActivity("★", `Strong match found: ${scored.candidate.name} (${match.score}% compatible) — report ready.`);
            });
          });

          const doneAt = 3800 + picks.length * 1400 + 600;
          later(doneAt, () => {
            setState((s2) => ({ ...s2, agentRunning: false }));
            pushActivity(
              "✓",
              picks.length
                ? `Matching round complete — ${picks.length} introduction${picks.length === 1 ? "" : "s"} recommended, ${ranked.length - picks.length} candidates below your bar.`
                : profile.premium
                  ? `Matching round complete — no new candidates cleared your bar this round.`
                  : `Free match limit reached. Upgrade to keep ${agent} searching.`,
            );
          });
          return s;
        });
      },

      setMatchStatus(matchId, status) {
        setState((s) => ({
          ...s,
          matches: s.matches.map((m) => (m.id === matchId ? { ...m, status } : m)),
        }));
        if (status === "approved") {
          const m = state.matches.find((x) => x.id === matchId);
          const c = CANDIDATES.find((x) => x.id === m?.candidateId);
          pushActivity("✉", `You approved the intro${c ? ` to ${c.name}` : ""}. Waiting on their side…`);
          later(2200, () => {
            setState((s) => ({
              ...s,
              matches: s.matches.map((x) => (x.id === matchId ? { ...x, status: "mutual" } : x)),
            }));
            pushActivity("♛", `${c?.name ?? "They"} approved too — it's mutual. A private chat is now open.`);
          });
        }
        if (status === "declined") {
          pushActivity("−", "Match declined. Your agent noted the pattern to refine future rounds.");
          const m = state.matches.find((x) => x.id === matchId);
          const c = CANDIDATES.find((x) => x.id === m?.candidateId);
          if (c) {
            setState((s) => ({
              ...s,
              insights: [
                {
                  id: uid("ins"),
                  text: `You passed on ${c.name} (${c.headline.toLowerCase()}). Should your agent deprioritize similar profiles?`,
                  source: "Match decision",
                  status: "pending",
                },
                ...s.insights,
              ],
            }));
          }
        }
      },

      sendChat(matchId, text) {
        setState((s) => ({
          ...s,
          matches: s.matches.map((m) =>
            m.id === matchId ? { ...m, chat: [...m.chat, { from: "you" as const, text, at: Date.now() }] } : m,
          ),
        }));
        const m = state.matches.find((x) => x.id === matchId);
        const c = CANDIDATES.find((x) => x.id === m?.candidateId);
        if (!c) return;
        later(1400 + Math.random() * 1200, () => {
          setState((s) => ({
            ...s,
            matches: s.matches.map((mm) =>
              mm.id === matchId
                ? { ...mm, chat: [...mm.chat, { from: "them" as const, text: candidateReply(c, text), at: Date.now() }] }
                : mm,
            ),
          }));
        });
      },

      scheduleCall(matchId, when) {
        setState((s) => ({
          ...s,
          matches: s.matches.map((m) => (m.id === matchId ? { ...m, callScheduled: when } : m)),
        }));
        pushActivity("◷", `Video call scheduled: ${when}. Both calendars confirmed.`);
      },

      giveFeedback(matchId, feedback) {
        setState((s) => {
          const m = s.matches.find((x) => x.id === matchId);
          const c = CANDIDATES.find((x) => x.id === m?.candidateId);
          const insight: Insight = {
            id: uid("ins"),
            text:
              feedback === "strong chemistry" || feedback === "good"
                ? `"${feedback}" with ${c?.name ?? "this match"} — weight similar ${c?.values[0] ?? ""} profiles higher?`
                : `"${feedback}" with ${c?.name ?? "this match"} — adjust your agent's filters to reflect this?`,
            source: "Match feedback",
            status: "pending",
          };
          return {
            ...s,
            matches: s.matches.map((x) => (x.id === matchId ? { ...x, feedback } : x)),
            insights: [insight, ...s.insights],
          };
        });
        pushActivity("✎", `Feedback recorded. Your agent drafted a learning update for your review.`);
      },

      setInsightStatus(id, status) {
        setState((s) => ({
          ...s,
          insights: s.insights.map((i) => (i.id === id ? { ...i, status } : i)),
        }));
        if (status === "approved") pushActivity("↑", "Learning update approved — your agent's model of you just got sharper.");
      },

      setPremium(premium) {
        setState((s) => (s.profile ? { ...s, profile: { ...s.profile, premium } } : s));
        if (premium) pushActivity("♛", "Premium activated. Agent conversation limits lifted; priority matching enabled.");
      },

      markInterviewDone() {
        setState((s) => (s.profile ? { ...s, profile: { ...s.profile, interviewDone: true } } : s));
      },

      addActivity: pushActivity,

      resetAll() {
        localStorage.removeItem(STORAGE_KEY);
        setState(emptyState);
      },
    };
  }, [state]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { uid };
