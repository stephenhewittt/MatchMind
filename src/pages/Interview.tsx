import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import AudioMeter from "../components/AudioMeter";
import BrainCanvas from "../components/BrainCanvas";
import { AgentOrb, EmptyState } from "../components/ui";
import { selectQuestions } from "../lib/interviewQuestions";
import type { InterviewQuestion } from "../lib/interviewQuestions";
import { uid, useStore } from "../lib/store";
import type { ProfileFact } from "../lib/types";

type Phase = "intro" | "denied" | "interview" | "complete";
type AnswerState = "prompt" | "countdown" | "recording" | "review";

const MAX_SECONDS = 90;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function Interview() {
  const navigate = useNavigate();
  const store = useStore();
  const { profile } = store;

  const [phase, setPhase] = useState<Phase>("intro");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [noCamera, setNoCamera] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState<AnswerState>("prompt");
  const [count, setCount] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const [chosen, setChosen] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const [typed, setTyped] = useState("");

  const liveRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const q = questions[qIndex];
  const isLast = qIndex === questions.length - 1;

  // Attach the live stream to the video element whenever both exist.
  useEffect(() => {
    if (liveRef.current && stream) {
      liveRef.current.srcObject = stream;
      liveRef.current.play().catch(() => {});
    }
  }, [stream, phase, answer, watching]);

  // Typewriter effect for each question prompt.
  useEffect(() => {
    if (phase !== "interview" || !q) return;
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(q.prompt.slice(0, i));
      if (i >= q.prompt.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [qIndex, phase, q]);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stopTracks(), [stopTracks]);

  const begin = async () => {
    if (!profile) return;
    setQuestions(selectQuestions(profile.intents));
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 } },
        audio: true,
      });
      setStream(s);
      streamRef.current = s;
      setPhase("interview");
    } catch {
      setPhase("denied");
    }
  };

  const beginTextOnly = () => {
    if (!profile) return;
    if (questions.length === 0) setQuestions(selectQuestions(profile.intents));
    setNoCamera(true);
    setPhase("interview");
  };

  // Countdown → recording.
  useEffect(() => {
    if (answer !== "countdown") return;
    setCount(3);
    const id = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(id);
          startRecording();
          return 0;
        }
        return c - 1;
      });
    }, 800);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer]);

  const startRecording = () => {
    setSeconds(0);
    setRecordedUrl(null);
    chunksRef.current = [];
    if (stream && typeof MediaRecorder !== "undefined") {
      try {
        const rec = new MediaRecorder(stream);
        rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
        rec.onstop = () => {
          if (chunksRef.current.length) {
            const blob = new Blob(chunksRef.current, { type: chunksRef.current[0] instanceof Blob ? (chunksRef.current[0] as Blob).type : "video/webm" });
            setRecordedUrl(URL.createObjectURL(blob));
          }
        };
        rec.start();
        recorderRef.current = rec;
      } catch {
        recorderRef.current = null;
      }
    }
    setAnswer("recording");
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_SECONDS) {
          finishRecording();
          return MAX_SECONDS;
        }
        return s + 1;
      });
    }, 1000);
  };

  const finishRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch {
        /* noop */
      }
    }
    setAnswer("review");
  };

  const toggle = (chip: string) =>
    setChosen((prev) => (prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]));

  const saveAndNext = () => {
    if (q) {
      const value =
        note.trim() ||
        (chosen.length ? chosen.join(", ") : `Answered on camera: "${q.prompt}"`);
      const fact: ProfileFact = {
        id: uid("f"),
        category: q.category,
        label: `Interview: ${q.factLabel}`,
        value: value.slice(0, 240),
        tier: "match-only",
        source: "interview",
      };
      store.addFacts([fact]);
    }
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setWatching(false);
    setChosen([]);
    setNote("");
    setSeconds(0);

    if (isLast) {
      store.markInterviewDone();
      store.addActivity("✎", `Virtual interview complete. ${profile?.agentName} captured ${questions.length} new insights in your vault.`);
      stopTracks();
      setStream(null);
      setPhase("complete");
    } else {
      setQIndex((i) => i + 1);
      setAnswer("prompt");
    }
  };

  const retake = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setWatching(false);
    setChosen([]);
    setNote("");
    setAnswer("prompt");
  };

  if (!profile) {
    return (
      <Layout>
        <EmptyState
          icon="✎"
          title="Create your agent first"
          sub="The virtual interview trains an existing agent — set up your profile to begin."
          action={<button onClick={() => navigate("/onboarding")} className="btn-gold">Create your agent</button>}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">Virtual Interview · on camera</div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-100">Look into the lens. Let {profile.agentName} get to know you.</h2>
        <p className="mt-2 max-w-2xl text-base text-zinc-400">
          A short video interview tailored to what you're looking for. Answer out loud, like a real conversation —
          your recordings stay on your device and never leave it.
        </p>
      </div>

      {phase === "intro" && <IntroCard profile={profile} onEnable={begin} onText={beginTextOnly} interviewDone={profile.interviewDone} />}

      {phase === "denied" && (
        <div className="card p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-2xl text-rose-400">⚠</div>
          <h3 className="font-display text-xl font-semibold text-zinc-100">Camera access needed</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            We couldn't reach your camera. Allow camera & microphone access in your browser, or continue with a
            typed interview instead — your answers still train {profile.agentName}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={begin} className="btn-gold">Try camera again</button>
            <button onClick={beginTextOnly} className="btn-ghost">Answer with text instead</button>
          </div>
        </div>
      )}

      {phase === "interview" && q && (
        <InterviewStage
          profile={profile}
          question={q}
          index={qIndex}
          total={questions.length}
          answer={answer}
          setAnswer={setAnswer}
          count={count}
          seconds={seconds}
          stream={stream}
          noCamera={noCamera}
          liveRef={liveRef}
          playbackRef={playbackRef}
          recordedUrl={recordedUrl}
          watching={watching}
          setWatching={setWatching}
          typed={typed}
          chosen={chosen}
          toggle={toggle}
          note={note}
          setNote={setNote}
          onStart={() => setAnswer("countdown")}
          onFinish={finishRecording}
          onRetake={retake}
          onNext={saveAndNext}
          isLast={isLast}
        />
      )}

      {phase === "complete" && <CompleteCard profile={profile} count={questions.length} onDone={() => navigate("/app")} onVault={() => navigate("/app/privacy")} />}
    </Layout>
  );
}

/* ------------------------------- Intro ------------------------------- */

function IntroCard({
  profile,
  onEnable,
  onText,
  interviewDone,
}: {
  profile: { agentName: string; intents: string[] };
  onEnable: () => void;
  onText: () => void;
  interviewDone: boolean;
}) {
  return (
    <div className="card relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
      <div className="grid gap-8 p-8 md:grid-cols-2 md:p-10">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <AgentOrb active size="h-12 w-12" />
            <div>
              <div className="text-sm font-medium text-zinc-200">MatchMind Interviewer</div>
              <div className="text-xs text-zinc-500">private session · on-device</div>
            </div>
          </div>
          <h3 className="font-display text-2xl font-semibold text-zinc-100">
            {interviewDone ? "Ready for another session?" : "A five-minute conversation that changes everything."}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            I'll ask a handful of thoughtful questions — tailored to what you're looking for. Answer out loud, on
            camera, like you're talking to a friend. The more real you are, the sharper {profile.agentName} gets.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-zinc-300">
            {[
              ["🔒", "Recordings stay on your device — never uploaded."],
              ["🎯", "Questions personalized to your goals."],
              ["🧠", "Every answer becomes a private insight you control."],
              ["🔁", "Re-record any answer until it feels right."],
            ].map(([icon, text]) => (
              <li key={text} className="flex items-start gap-2.5">
                <span>{icon}</span>
                <span className="text-zinc-400">{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={onEnable} className="btn-gold px-6 py-3">🎥 Enable camera & begin</button>
            <button onClick={onText} className="btn-ghost">Prefer text? Start typed</button>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-60">
            <BrainCanvas size={280} points={200} interactive={false} />
          </div>
          <div className="relative z-10 rounded-2xl border border-ink-600/70 bg-ink-950/40 p-6 text-center backdrop-blur-sm">
            <div className="text-4xl">🎬</div>
            <div className="mt-3 font-display text-lg font-semibold text-gold-300">Lights, camera, you.</div>
            <div className="mt-1 text-xs text-zinc-500">Best in a quiet, well-lit spot.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Interview stage ---------------------------- */

interface StageProps {
  profile: { agentName: string };
  question: InterviewQuestion;
  index: number;
  total: number;
  answer: AnswerState;
  setAnswer: (a: AnswerState) => void;
  count: number;
  seconds: number;
  stream: MediaStream | null;
  noCamera: boolean;
  liveRef: React.RefObject<HTMLVideoElement>;
  playbackRef: React.RefObject<HTMLVideoElement>;
  recordedUrl: string | null;
  watching: boolean;
  setWatching: (b: boolean) => void;
  typed: string;
  chosen: string[];
  toggle: (c: string) => void;
  note: string;
  setNote: (s: string) => void;
  onStart: () => void;
  onFinish: () => void;
  onRetake: () => void;
  onNext: () => void;
  isLast: boolean;
}

function InterviewStage(p: StageProps) {
  const { question: q, answer } = p;

  return (
    <div>
      {/* Progress dots */}
      <div className="mb-5 flex items-center gap-2">
        {Array.from({ length: p.total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i < p.index ? "bg-gold-500" : i === p.index ? "bg-gradient-to-r from-gold-500 to-gold-300" : "bg-ink-700"
            }`}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Video / stage */}
        <div className="lg:col-span-3">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-ink-600/70 bg-ink-950 shadow-card">
            {/* Gold corner brackets */}
            {["left-3 top-3 border-l-2 border-t-2", "right-3 top-3 border-r-2 border-t-2", "left-3 bottom-3 border-l-2 border-b-2", "right-3 bottom-3 border-r-2 border-b-2"].map((c) => (
              <span key={c} className={`pointer-events-none absolute z-20 h-6 w-6 rounded-[3px] border-gold-500/50 ${c}`} />
            ))}

            {p.noCamera ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <AgentOrb active size="h-12 w-12" />
                <p className="text-sm text-zinc-400">Text mode — type your answer below.</p>
              </div>
            ) : (
              <>
                <video
                  ref={p.liveRef}
                  muted
                  playsInline
                  className={`h-full w-full -scale-x-100 object-cover transition-opacity duration-300 ${p.watching ? "opacity-0" : "opacity-100"}`}
                />
                {p.watching && p.recordedUrl && (
                  <video ref={p.playbackRef} src={p.recordedUrl} controls autoPlay className="absolute inset-0 h-full w-full object-cover" />
                )}
              </>
            )}

            {/* Recording badge */}
            {answer === "recording" && (
              <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink-950/80 px-3 py-1.5 backdrop-blur-sm">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500" />
                <span className="text-xs font-semibold tracking-wide text-rose-300">REC</span>
                <span className="font-display text-sm tabular-nums text-zinc-200">{fmt(p.seconds)}</span>
              </div>
            )}

            {/* Countdown overlay */}
            {answer === "countdown" && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink-950/60 backdrop-blur-sm">
                <div key={p.count} className="animate-fade-up font-display text-8xl font-bold text-gold-300">{p.count}</div>
              </div>
            )}

            {/* Live audio meter while recording */}
            {answer === "recording" && !p.noCamera && (
              <div className="absolute inset-x-0 bottom-0 z-20 flex h-16 items-end gap-[3px] bg-gradient-to-t from-ink-950/90 to-transparent px-6 pb-3">
                <AudioMeter stream={p.stream} bars={40} className="h-10 w-full" />
              </div>
            )}

            {/* Prompt overlay (idle) */}
            {(answer === "prompt" || answer === "review") && !p.watching && (
              <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent p-5">
                {q.fun && (
                  <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-gold-500/40 bg-gold-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold-300">
                    ✨ fun one
                  </span>
                )}
                <p className="font-display text-lg font-medium leading-snug text-zinc-100">{p.typed}</p>
              </div>
            )}
          </div>

          {/* Controls under the video */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {answer === "prompt" && !p.noCamera && (
              <>
                <button onClick={p.onStart} className="btn-gold px-6">● Start answer</button>
                <span className="text-xs text-zinc-500">Take a breath, then speak naturally. Up to 90 seconds.</span>
              </>
            )}
            {answer === "recording" && (
              <button onClick={p.onFinish} className="btn-gold px-6">■ Finish answer</button>
            )}
            {answer === "review" && !p.noCamera && (
              <>
                {p.recordedUrl && (
                  <button onClick={() => p.setWatching(!p.watching)} className="btn-ghost">
                    {p.watching ? "↩ Back" : "▷ Watch back"}
                  </button>
                )}
                <button onClick={p.onRetake} className="btn-dark">↻ Re-record</button>
              </>
            )}
          </div>
        </div>

        {/* Side panel: interviewer + hints + reflection */}
        <div className="lg:col-span-2">
          <div className="card flex h-full flex-col p-6">
            <div className="mb-4 flex items-center gap-3">
              <AgentOrb active={answer === "recording"} size="h-10 w-10" />
              <div>
                <div className="text-sm font-medium text-zinc-200">MatchMind Interviewer</div>
                <div className="text-[11px] text-zinc-500">
                  Question {p.index + 1} of {p.total}
                  {answer === "recording" ? " · listening…" : ""}
                </div>
              </div>
            </div>

            {answer !== "review" ? (
              <>
                <p className="font-display text-lg leading-relaxed text-zinc-100">{p.typed}</p>
                <div className="mt-5">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-500">Talking points</div>
                  <ul className="space-y-2">
                    {q.hints.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-zinc-400">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-600" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {p.noCamera && answer === "prompt" && (
                  <div className="mt-5">
                    <textarea
                      className="input-dark min-h-28"
                      value={p.note}
                      onChange={(e) => p.setNote(e.target.value)}
                      placeholder="Type your answer…"
                    />
                    <button onClick={() => p.onNext()} disabled={!p.note.trim()} className="btn-gold mt-3 w-full">
                      {p.isLast ? "Finish interview" : "Save & next question"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-emerald-400">
                  <span>✓</span> Answer captured
                </div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gold-500">Tag your answer (optional)</div>
                <div className="flex flex-wrap gap-2">
                  {q.chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => p.toggle(chip)}
                      className={`rounded-full border px-3 py-1 text-xs transition-all ${
                        p.chosen.includes(chip)
                          ? "border-gold-500 bg-gold-500/15 text-gold-300"
                          : "border-ink-600 text-zinc-400 hover:border-gold-600/50"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <textarea
                  className="input-dark mt-3 min-h-20 text-sm"
                  value={p.note}
                  onChange={(e) => p.setNote(e.target.value)}
                  placeholder="Add a note for your agent (optional)…"
                />
                <button onClick={p.onNext} className="btn-gold mt-4 w-full">
                  {p.isLast ? "Finish interview ✓" : "Save & next question →"}
                </button>
                <p className="mt-2 text-center text-[11px] text-zinc-600">Saved privately as “Use for Matching Only.”</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Complete ------------------------------ */

function CompleteCard({
  profile,
  count,
  onDone,
  onVault,
}: {
  profile: { agentName: string };
  count: number;
  onDone: () => void;
  onVault: () => void;
}) {
  return (
    <div className="card relative overflow-hidden p-10 text-center">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
      {/* Celebration rings */}
      <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-gold-500/30"
            style={{ animationDelay: `${i * 0.4}s`, animationDuration: "2.4s" }}
          />
        ))}
      </div>
      <div className="relative mx-auto mb-4 flex justify-center">
        <BrainCanvas size={200} points={210} />
      </div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">Interview complete</div>
      <h3 className="font-display text-3xl font-bold text-zinc-100">{profile.agentName} just leveled up.</h3>
      <p className="mx-auto mt-3 max-w-lg text-base text-zinc-400">
        I filed <span className="text-gold-300">{count} new insights</span> into your vault — all labeled “Use for
        Matching Only.” Your virtual brain is noticeably sharper. Review, re-label, or delete any of them anytime.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button onClick={onVault} className="btn-ghost">Review my vault</button>
        <button onClick={onDone} className="btn-gold px-6">Back to console →</button>
      </div>
    </div>
  );
}
