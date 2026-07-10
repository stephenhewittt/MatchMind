import { useEffect, useRef } from "react";

interface BrainCanvasProps {
  /** CSS size of the (square) canvas in px */
  size?: number;
  /** Number of cortex points */
  points?: number;
  /** Rotation speed multiplier */
  speed?: number;
  /** Follow the cursor with a slight parallax tilt */
  interactive?: boolean;
  className?: string;
}

type P3 = [number, number, number];

/** Deterministic PRNG so the brain looks identical every visit. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Point-cloud shell shaped like a brain in profile: lumpy cortex, cerebellum, stem. */
function makeBrain(count: number): P3[] {
  const rand = mulberry32(20260710);
  const pts: P3[] = [];

  for (let i = 0; i < count; i++) {
    let x = rand() * 2 - 1;
    let y = rand() * 2 - 1;
    let z = rand() * 2 - 1;
    const len = Math.hypot(x, y, z) || 1;
    x /= len; y /= len; z /= len;

    // Lumpy radius gives the low-poly cortical folds
    const lump =
      0.88 +
      0.14 * Math.sin(x * 7 + y * 5) * Math.sin(z * 6 - y * 4) +
      0.05 * (rand() - 0.5);

    let px = x * 1.28 * lump; // long axis: front-back
    let py = y * 0.95 * lump;
    let pz = z * 0.98 * lump;

    // Flatten the underside where the brain sits
    if (py < -0.55) py = -0.55 + (py + 0.55) * 0.3;
    // Hint of the longitudinal fissure between hemispheres
    if (py > 0.2) pz += Math.sign(pz) * 0.06;
    // Taper the frontal lobe slightly downward
    if (px > 0.8) py -= (px - 0.8) * 0.25;

    pts.push([px, py, pz]);
  }

  // Cerebellum: dense small lobe at the lower back
  for (let i = 0; i < Math.floor(count * 0.14); i++) {
    let x = rand() * 2 - 1, y = rand() * 2 - 1, z = rand() * 2 - 1;
    const len = Math.hypot(x, y, z) || 1;
    pts.push([-0.82 + (x / len) * 0.36, -0.5 + (y / len) * 0.24, (z / len) * 0.46]);
  }

  // Brain stem descending from beneath
  const stem = Math.floor(count * 0.05);
  for (let i = 0; i < stem; i++) {
    const t = i / stem;
    pts.push([
      -0.4 - t * 0.18 + (rand() - 0.5) * 0.1,
      -0.62 - t * 0.55,
      (rand() - 0.5) * 0.18,
    ]);
  }

  return pts;
}

/** Nearest-neighbour wireframe over the point cloud. */
function makeEdges(pts: P3[]): [number, number][] {
  const edges: [number, number][] = [];
  const degree = new Array(pts.length).fill(0);
  const maxDist = 0.32;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if (degree[i] > 4) break;
      if (degree[j] > 4) continue;
      const dx = pts[i][0] - pts[j][0];
      const dy = pts[i][1] - pts[j][1];
      const dz = pts[i][2] - pts[j][2];
      if (dx * dx + dy * dy + dz * dz < maxDist * maxDist) {
        edges.push([i, j]);
        degree[i]++;
        degree[j]++;
      }
    }
  }
  return edges;
}

export default function BrainCanvas({
  size = 420,
  points = 300,
  speed = 1,
  interactive = true,
  className = "",
}: BrainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const pts = makeBrain(points);
    const edges = makeEdges(pts);
    const cx = size / 2;
    const cy = size / 2;
    const scale = size * 0.3;
    const tiltBase = -0.18;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let tilt = tiltBase;
    let yawOffset = 0;

    const draw = (now: number) => {
      const t = now / 1000;
      const yawTarget = interactive ? mouse.current.x * 0.35 : 0;
      const tiltTarget = tiltBase + (interactive ? mouse.current.y * 0.2 : 0);
      yawOffset += (yawTarget - yawOffset) * 0.05;
      tilt += (tiltTarget - tilt) * 0.05;
      const yaw = t * 0.22 * speed + yawOffset;

      ctx.clearRect(0, 0, size, size);

      // Ambient glow behind the brain
      const glow = ctx.createRadialGradient(cx, cy, size * 0.05, cx, cy, size * 0.5);
      glow.addColorStop(0, "rgba(217,178,92,0.10)");
      glow.addColorStop(1, "rgba(217,178,92,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size, size);

      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
      const cosX = Math.cos(tilt), sinX = Math.sin(tilt);

      const proj: [number, number, number][] = pts.map(([x, y, z]) => {
        const rx = x * cosY + z * sinY;
        const rz = -x * sinY + z * cosY;
        const ry = y * cosX - rz * sinX;
        const rz2 = y * sinX + rz * cosX;
        const p = 2.6 / (2.6 - rz2);
        return [cx + rx * scale * p, cy - ry * scale * p, p];
      });

      // Wireframe
      ctx.lineWidth = 0.6;
      for (const [i, j] of edges) {
        const [x1, y1, p1] = proj[i];
        const [x2, y2, p2] = proj[j];
        const depth = (p1 + p2) / 2;
        const a = Math.max(0.04, (depth - 0.78) * 0.42);
        // Occasional "signal" pulse travelling along the mesh
        const firing = Math.sin(t * 2.2 + i * 0.7) > 0.985;
        ctx.strokeStyle = firing ? `rgba(255,200,110,${Math.min(0.9, a * 3)})` : `rgba(217,178,92,${a})`;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Nodes
      for (let i = 0; i < proj.length; i++) {
        const [x, y, p] = proj[i];
        const a = Math.max(0.12, (p - 0.8) * 0.9);
        ctx.fillStyle = `rgba(232,201,126,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.1 * p, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sparkling synapses with star flares
      for (let i = 0; i < proj.length; i += 13) {
        const [x, y, p] = proj[i];
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + i * 1.3);
        if (pulse < 0.35) continue;
        const r = (1.6 + pulse * 2.4) * p;
        const a = pulse * Math.max(0.15, (p - 0.8) * 1.1);
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4);
        grad.addColorStop(0, `rgba(255,224,160,${a})`);
        grad.addColorStop(1, "rgba(255,224,160,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
        ctx.fill();
        // 4-point flare
        ctx.strokeStyle = `rgba(255,232,180,${a * 0.9})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(x - r * 2.2, y); ctx.lineTo(x + r * 2.2, y);
        ctx.moveTo(x, y - r * 2.2); ctx.lineTo(x, y + r * 2.2);
        ctx.stroke();
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    if (interactive && !reduced) window.addEventListener("mousemove", onMove);

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      if (interactive && !reduced) window.removeEventListener("mousemove", onMove);
    };
  }, [size, points, speed, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size, maxWidth: "100%" }}
      aria-hidden="true"
    />
  );
}
