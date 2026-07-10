import { useEffect, useRef } from "react";

/**
 * Live audio-level bars driven by the microphone stream via the Web Audio API.
 * Reacts in real time to the speaker's voice.
 */
export default function AudioMeter({
  stream,
  bars = 32,
  className = "",
  barClassName = "",
}: {
  stream: MediaStream | null;
  bars?: number;
  className?: string;
  barClassName?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) return;
    const AC: typeof AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    let ctx: AudioContext;
    try {
      ctx = new AC();
    } catch {
      return;
    }
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.75;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const children = wrap.current?.children;
      if (children) {
        const step = Math.floor(data.length / children.length) || 1;
        for (let i = 0; i < children.length; i++) {
          // Emphasize the vocal range in the middle bars.
          const raw = data[i * step] ?? 0;
          const level = Math.max(0.1, Math.min(1, (raw / 255) * 1.4));
          (children[i] as HTMLElement).style.transform = `scaleY(${level})`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      source.disconnect();
      ctx.close().catch(() => {});
    };
  }, [stream]);

  return (
    <div ref={wrap} className={`flex items-center gap-[3px] ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] flex-1 origin-bottom rounded-full bg-gradient-to-t from-bronze to-gold-300 transition-transform duration-75 ${barClassName}`}
          style={{ height: "100%", transform: "scaleY(0.1)" }}
        />
      ))}
    </div>
  );
}
