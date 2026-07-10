import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { AgentOrb, EmptyState, TypingDots } from "../components/ui";
import { uid, useStore } from "../lib/store";
import type { FactCategory } from "../lib/types";

interface InterviewQ {
  question: string;
  followUp: (answer: string) => string;
  category: FactCategory;
  label: string;
}

const QUESTIONS: InterviewQ[] = [
  {
    question: "Let's go deeper than the forms. When you picture a genuinely great connection — any kind — what does the first hour together feel like?",
    followUp: (a) =>
      a.length > 120
        ? "You paint a vivid picture — I can work with that. What tends to break that feeling for you? What makes an interaction fall flat?"
        : "Interesting. And the opposite — what makes an interaction fall flat for you, even when the person looks good on paper?",
    category: "values",
    label: "Connection style",
  },
  {
    question: "What's something people consistently misunderstand about you at first?",
    followUp: () =>
      "That's genuinely useful — I'll make sure the right people see past that. Who *gets* you quickly? What do those people have in common?",
    category: "sensitive",
    label: "First impressions",
  },
  {
    question: "Think about the best friendship or partnership you've ever had. What made it work — really?",
    followUp: () =>
      "Noted, and weighted heavily. Last one: what's a boundary you've learned to protect — something you'd want me to guard for you in early conversations?",
    category: "values",
    label: "What makes bonds work",
  },
  {
    question: "",
    followUp: () => "",
    category: "sensitive",
    label: "Boundaries",
  },
];

interface Msg {
  from: "ai" | "user";
  text: string;
}

export default function Interview() {
  const navigate = useNavigate();
  const store = useStore();
  const { profile } = store;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [awaitingFollowUp, setAwaitingFollowUp] = useState(false);
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(profile?.interviewDone ?? false);
  const [started, setStarted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (!profile) {
    return (
      <Layout>
        <EmptyState icon="✎" title="Create your agent first"
          sub="The virtual interview trains an existing agent — set up your profile to begin."
          action={<button onClick={() => navigate("/onboarding")} className="btn-gold">Create your agent</button>} />
      </Layout>
    );
  }

  const aiSay = (text: string, delay = 1100) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "ai", text }]);
    }, delay);
  };

  const start = () => {
    setStarted(true);
    aiSay(
      `Hi ${profile.name.split(" ")[0]} — I'm the MatchMind interviewer. This is private: nothing here is shared with anyone, and every insight I draw goes to your vault for *your* approval first. Ready?`,
      800,
    );
    setTimeout(() => aiSay(QUESTIONS[0].question, 1400), 2400);
  };

  const send = () => {
    const text = input.trim();
    if (!text || typing || done) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");

    const q = QUESTIONS[qIndex];

    // Bank the answer as a vault fact (match-only by default — most conservative).
    store.addFacts([
      {
        id: uid("f"),
        category: q.category,
        label: `Interview: ${q.label}`,
        value: text.slice(0, 200),
        tier: "match-only",
        source: "interview",
      },
    ]);

    if (!awaitingFollowUp && q.followUp(text)) {
      aiSay(q.followUp(text));
      setAwaitingFollowUp(true);
      return;
    }

    setAwaitingFollowUp(false);
    const nextIndex = qIndex + 1;
    if (nextIndex < QUESTIONS.length && QUESTIONS[nextIndex].question) {
      setQIndex(nextIndex);
      aiSay(QUESTIONS[nextIndex].question);
    } else {
      setDone(true);
      store.markInterviewDone();
      store.addActivity("✎", `Virtual interview complete. ${profile.agentName} added ${qIndex + 2} private insights to your vault (all "match-only").`);
      aiSay(
        `That's everything for today — thank you for being candid. I've filed ${qIndex + 2} insights into your Privacy Vault, all labeled "Use for Matching Only." ${profile.agentName} just got noticeably sharper. You can review, re-label, or delete any of them.`,
        1600,
      );
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">Virtual Interview · deepens your neural profile</div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-100">A private conversation that wires your virtual brain</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Text, voice, or video-style — the interviewer asks thoughtful follow-ups to understand your personality,
          goals, values, and boundaries. Every answer becomes a new connection in your digital mind, sealed in your vault.
        </p>
      </div>

      <div className="card flex min-h-[480px] flex-col">
        <div className="flex items-center gap-3 border-b border-ink-700/70 px-6 py-4">
          <AgentOrb active={typing} size="h-9 w-9" />
          <div>
            <div className="text-sm font-medium text-zinc-200">MatchMind Interviewer</div>
            <div className="text-[11px] text-zinc-500">{typing ? "thinking…" : done ? "session complete" : "private session · encrypted"}</div>
          </div>
          {profile.interviewDone && <span className="ml-auto text-xs text-gold-400">✓ Completed</span>}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {!started && !done && (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <AgentOrb size="h-14 w-14" />
              <p className="mt-6 max-w-md text-sm text-zinc-400">
                Four questions, a few thoughtful follow-ups, about five minutes. The deepest training your agent can get.
              </p>
              <button onClick={start} className="btn-gold mt-6">Begin interview</button>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.from === "user" ? "rounded-br-sm bg-gold-500/15 text-zinc-100" : "rounded-bl-sm bg-ink-700 text-zinc-300"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-ink-700 px-4 py-3"><TypingDots /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {started && !done && (
          <div className="flex gap-2 border-t border-ink-700/70 p-4">
            <input
              className="input-dark flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Answer honestly — it stays private…"
              disabled={typing}
            />
            <button onClick={send} disabled={typing || !input.trim()} className="btn-gold px-5">Send</button>
          </div>
        )}
        {done && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-700/70 p-4">
            <p className="text-xs text-zinc-500">Insights filed to your vault as "match-only." Review them anytime.</p>
            <div className="flex gap-2">
              <button onClick={() => navigate("/app/privacy")} className="btn-ghost text-sm">Review vault</button>
              <button onClick={() => navigate("/app")} className="btn-gold text-sm">Back to console</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
