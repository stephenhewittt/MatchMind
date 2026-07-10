import type { Appearance } from "../lib/showcase";

/**
 * Stylized illustrated portrait rendered entirely in SVG (no external images).
 * Elegant duotone/flat-illustration look to match the luxury aesthetic.
 */
export default function PersonPortrait({ a, id }: { a: Appearance; id: string }) {
  const gid = (n: string) => `${id}-${n}`;

  return (
    <svg viewBox="0 0 240 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice" role="img">
      <defs>
        <radialGradient id={gid("bg")} cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor={a.bg[0]} />
          <stop offset="100%" stopColor={a.bg[1]} />
        </radialGradient>
        <linearGradient id={gid("skin")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={a.skin[0]} />
          <stop offset="100%" stopColor={a.skin[1]} />
        </linearGradient>
        <linearGradient id={gid("cloth")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={a.clothing} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      <rect width="240" height="300" fill={`url(#${gid("bg")})`} />

      {/* Back hair for longer styles */}
      {(a.hairStyle === "long" || a.hairStyle === "wavy") && (
        <path d="M58 118 C58 60 100 40 120 40 C140 40 182 60 182 118 L186 220 L164 214 C168 150 160 120 120 120 C80 120 72 150 76 214 L54 220 Z" fill={a.hair} />
      )}
      {a.hairStyle === "curly" && (
        <g fill={a.hair}>
          {[62, 92, 120, 148, 178].map((cx, i) => (
            <circle key={i} cx={cx} cy={70 + (i % 2) * 6} r="20" />
          ))}
          <circle cx="60" cy="110" r="18" />
          <circle cx="180" cy="110" r="18" />
        </g>
      )}
      {a.hairStyle === "coily" && (
        <g fill={a.hair}>
          {Array.from({ length: 22 }).map((_, i) => {
            const ang = (i / 22) * Math.PI;
            return <circle key={i} cx={120 - Math.cos(ang) * 66} cy={116 - Math.sin(ang) * 66} r="14" />;
          })}
        </g>
      )}

      {/* Shoulders / clothing */}
      <path d="M28 300 C28 236 74 208 120 208 C166 208 212 236 212 300 Z" fill={`url(#${gid("cloth")})`} />
      <path d="M120 208 L120 300" stroke="#000" strokeOpacity="0.18" strokeWidth="6" />

      {/* Neck */}
      <path d="M104 176 L136 176 L134 214 C130 220 110 220 106 214 Z" fill={`url(#${gid("skin")})`} />
      <path d="M104 176 L136 176 L135 190 C128 198 112 198 105 190 Z" fill="#000" fillOpacity="0.12" />

      {/* Ears */}
      <ellipse cx="70" cy="128" rx="9" ry="14" fill={`url(#${gid("skin")})`} />
      <ellipse cx="170" cy="128" rx="9" ry="14" fill={`url(#${gid("skin")})`} />

      {/* Head */}
      <ellipse cx="120" cy="122" rx="52" ry="62" fill={`url(#${gid("skin")})`} />

      {/* Cheek shading */}
      <ellipse cx="120" cy="140" rx="46" ry="44" fill="#000" fillOpacity="0.05" />

      {/* Eyebrows */}
      <path d="M92 108 q10 -6 22 -1" stroke={a.hair} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M126 107 q12 -5 22 1" stroke={a.hair} strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Eyes */}
      <ellipse cx="103" cy="120" rx="5.5" ry="6.5" fill="#2a1f1a" />
      <ellipse cx="137" cy="120" rx="5.5" ry="6.5" fill="#2a1f1a" />
      <circle cx="105" cy="118" r="1.6" fill="#fff" fillOpacity="0.85" />
      <circle cx="139" cy="118" r="1.6" fill="#fff" fillOpacity="0.85" />

      {/* Nose */}
      <path d="M120 124 L116 140 q4 4 9 0" stroke="#000" strokeOpacity="0.18" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Mouth */}
      <path d="M108 156 q12 10 24 0" stroke="#7a3b34" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Beard */}
      {a.beard && (
        <path
          d="M74 130 C74 175 96 196 120 196 C144 196 166 175 166 130 C166 150 150 168 120 168 C90 168 74 150 74 130 Z"
          fill={a.hair}
          fillOpacity="0.92"
        />
      )}

      {/* Front hair by style */}
      {a.hairStyle === "short" && (
        <path d="M66 120 C60 66 100 44 120 44 C140 44 180 66 174 120 C174 96 168 78 120 78 C72 78 66 96 66 120 Z" fill={a.hair} />
      )}
      {a.hairStyle === "buzz" && (
        <path d="M70 116 C66 74 100 52 120 52 C140 52 174 74 170 116 C170 100 156 86 120 86 C84 86 70 100 70 116 Z" fill={a.hair} fillOpacity="0.9" />
      )}
      {(a.hairStyle === "long" || a.hairStyle === "wavy") && (
        <path d="M64 122 C58 62 100 42 120 42 C140 42 182 62 176 122 C176 92 166 74 120 74 C74 74 64 92 64 122 Z" fill={a.hair} />
      )}
      {a.hairStyle === "bun" && (
        <>
          <circle cx="120" cy="46" r="15" fill={a.hair} />
          <path d="M68 118 C64 68 100 50 120 50 C140 50 176 68 172 118 C172 92 160 76 120 76 C80 76 68 92 68 118 Z" fill={a.hair} />
        </>
      )}
      {a.hairStyle === "curly" && (
        <path d="M70 118 C66 92 84 80 120 80 C156 80 174 92 170 118 C170 100 156 90 120 90 C84 90 70 100 70 118 Z" fill={a.hair} fillOpacity="0.6" />
      )}

      {/* Glasses */}
      {a.glasses && (
        <g stroke="#e8c97e" strokeWidth="2.5" fill="none" strokeOpacity="0.9">
          <rect x="88" y="110" width="28" height="20" rx="6" />
          <rect x="124" y="110" width="28" height="20" rx="6" />
          <path d="M116 118 h8" />
          <path d="M88 116 l-14 -4" />
          <path d="M152 116 l14 -4" />
        </g>
      )}
    </svg>
  );
}
