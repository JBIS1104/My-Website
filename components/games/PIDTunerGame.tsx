"use client";

import { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";

function buildTrack(w: number, h: number) {
  if (w < 100 || h < 100) return [];
  const pts: { x: number; y: number }[] = [];
  const cx = w / 2, cy = h / 2, sc = Math.min(w, h) * 0.30;
  for (let i = 0; i < 800; i++) {
    const t = i / 800, a = t * Math.PI * 2;
    const r = sc * (1 + 0.3 * Math.sin(2 * a) + 0.15 * Math.cos(3 * a));
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function readSensor(track: { x: number; y: number }[], bx: number, by: number, heading: number, hint: number) {
  const sx = bx + Math.cos(heading) * 10, sy = by + Math.sin(heading) * 10;
  let best = hint, bestD = 1e18;
  const n = track.length;
  for (let o = -80; o <= 80; o++) {
    const i = ((hint + o) % n + n) % n;
    const d = (track[i].x - sx) ** 2 + (track[i].y - sy) ** 2;
    if (d < bestD) { bestD = d; best = i; }
  }
  const near = track[best];
  const px = Math.cos(heading + Math.PI / 2), py = Math.sin(heading + Math.PI / 2);
  return { nIdx: best, err: (near.x - sx) * px + (near.y - sy) * py, dist: Math.sqrt(bestD), sX: sx, sY: sy, nX: near.x, nY: near.y };
}

export function PIDTunerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const { resolvedTheme } = useTheme();
  const [kp, setKp] = useState(1.5);
  const [ki, setKi] = useState(0.0);
  const [kd, setKd] = useState(0.8);
  const [gameState, setGameState] = useState<"idle" | "running" | "done">("idle");
  const [score, setScore] = useState<number | null>(null);
  const [laps, setLaps] = useState(0);
  const kpRef = useRef(kp); kpRef.current = kp;
  const kiRef = useRef(ki); kiRef.current = ki;
  const kdRef = useRef(kd); kdRef.current = kd;
  const gsRef = useRef(gameState); gsRef.current = gameState;
  const sim = useRef({
    x: 0, y: 0, heading: 0,
    omega: 0,  // angular velocity — 2nd order dynamics!
    integral: 0, prevErr: 0, first: true,
    totErr: 0, steps: 0, nIdx: 0, laps: 0,
    track: [] as { x: number; y: number }[],
    pw: 0, ph: 0, offFrames: 0, trail: [] as {x:number,y:number}[],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isDark = resolvedTheme === "dark";
    const SPEED = 2.2;
    const ACCEL_GAIN = 0.002; // converts PID output to angular acceleration
    const FRICTION = 0.88;     // angular velocity friction per frame

    const animate = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        const cw = Math.round(rect.width * devicePixelRatio), ch = Math.round(rect.height * devicePixelRatio);
        if (canvas.width !== cw || canvas.height !== ch) {
          canvas.width = cw; canvas.height = ch;
          canvas.style.width = rect.width + "px"; canvas.style.height = rect.height + "px";
          ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        }
      }
      const w = canvas.width / devicePixelRatio, h = canvas.height / devicePixelRatio;
      if (w < 100 || h < 100) { animRef.current = requestAnimationFrame(animate); return; }
      ctx.clearRect(0, 0, w, h);
      const s = sim.current;
      if (s.track.length === 0 || Math.abs(s.pw - w) > 5 || Math.abs(s.ph - h) > 5) {
        s.track = buildTrack(w, h); s.pw = w; s.ph = h;
      }
      const track = s.track;
      if (track.length === 0) { animRef.current = requestAnimationFrame(animate); return; }

      // Draw track
      ctx.beginPath(); track.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.closePath();
      ctx.strokeStyle = isDark ? "rgba(134,239,172,0.1)" : "rgba(22,101,52,0.06)";
      ctx.lineWidth = 22; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
      ctx.beginPath(); track.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.closePath();
      ctx.strokeStyle = isDark ? "#86EFAC" : "#166534"; ctx.lineWidth = 2; ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = "butt";
      ctx.beginPath(); ctx.arc(track[0].x, track[0].y, 5, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "#86EFAC" : "#166534"; ctx.globalAlpha = 0.4; ctx.fill(); ctx.globalAlpha = 1;

      const state = gsRef.current;
      if (state === "running") {
        s.steps++;
        const n = track.length, prevN = s.nIdx;
        const r = readSensor(track, s.x, s.y, s.heading, s.nIdx);
        s.nIdx = r.nIdx;
        if (s.first) { s.prevErr = r.err; s.first = false; }
        s.integral += r.err;
        s.integral = Math.max(-30, Math.min(30, s.integral));
        const dErr = r.err - s.prevErr;
        s.prevErr = r.err;

        // 2ND ORDER: PID output = angular ACCELERATION
        // omega += accel, heading += omega
        // This means: high Kp WITHOUT Kd = oscillation!
        const accel = kpRef.current * r.err + kiRef.current * s.integral + kdRef.current * dErr;
        s.omega += accel * ACCEL_GAIN;
        s.omega *= FRICTION; // angular friction
        s.omega = Math.max(-0.05, Math.min(0.05, s.omega)); // max turning rate
        s.heading += s.omega;

        s.x += Math.cos(s.heading) * SPEED;
        s.y += Math.sin(s.heading) * SPEED;
        s.totErr += Math.abs(r.err);

        if (r.dist > 18) s.offFrames++; else s.offFrames = Math.max(0, s.offFrames - 2);
        if (prevN > n * 0.92 && s.nIdx < n * 0.08) { s.laps++; setLaps(s.laps); }
        if (s.offFrames > 60) { setScore(0); setGameState("done"); }

        // Draw buggy trail (last 200 positions)
        if (!s.trail) s.trail = [];
        s.trail.push({x: s.x, y: s.y});
        if (s.trail.length > 200) s.trail.shift();
        if (s.trail.length > 1) {
          ctx.beginPath();
          s.trail.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
          ctx.strokeStyle = isDark ? 'rgba(252,165,165,0.3)' : 'rgba(220,38,38,0.2)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        // Sensor line
        ctx.beginPath(); ctx.moveTo(r.sX, r.sY); ctx.lineTo(r.nX, r.nY);
        ctx.strokeStyle = isDark ? "rgba(252,165,165,0.4)" : "rgba(220,38,38,0.3)";
        ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
        // Sensor dots
        for (let si = 0; si < 6; si++) {
          const off = (si - 2.5) * 2.5;
          ctx.beginPath();
          ctx.arc(r.sX + Math.cos(s.heading + Math.PI / 2) * off, r.sY + Math.sin(s.heading + Math.PI / 2) * off, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = Math.abs(r.err) < 4 ? (isDark ? "#86EFAC" : "#166534") : "#FCA5A5";
          ctx.fill();
        }
        // Buggy
        ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.heading);
        ctx.fillStyle = isDark ? "#86EFAC" : "#166534";
        ctx.beginPath(); ctx.roundRect(-10, -6, 20, 12, 3); ctx.fill();
        ctx.fillStyle = isDark ? "#0c0a09" : "#fafaf9";
        ctx.fillRect(7, -8, 4, 3); ctx.fillRect(7, 5, 4, 3);
        ctx.fillRect(-11, -8, 4, 3); ctx.fillRect(-11, 5, 4, 3);
        ctx.fillStyle = "#FCA5A5"; ctx.beginPath(); ctx.arc(12, 0, 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // HUD
        ctx.font = "13px monospace";
        ctx.fillStyle = isDark ? "rgba(134,239,172,0.7)" : "rgba(22,101,52,0.8)";
        ctx.textAlign = "left";
        ctx.fillText("SENSOR: " + (r.err > 0 ? "+" : "") + r.err.toFixed(1), 12, h - 12);
        ctx.fillText("LAP: " + s.laps + "/1", 12, h - 28);
        ctx.fillText("\u03C9: " + s.omega.toFixed(4), 12, h - 44);
        ctx.textAlign = "right";
        ctx.fillStyle = r.dist > 15 ? "#FCA5A5" : Math.abs(s.omega) > 0.03 ? (isDark ? "#FCD34D" : "#b45309") : (isDark ? "rgba(134,239,172,0.7)" : "rgba(22,101,52,0.8)");
        ctx.fillText(r.dist > 15 ? "OFF LINE!" : Math.abs(s.omega) > 0.03 ? "OSCILLATING" : "STABLE", w - 12, h - 12);

        if (s.laps >= 1) {
          const avg = s.totErr / s.steps;
          setScore(Math.max(0, Math.round(100 - avg * 1.5)));
          setGameState("done");
        }
      } else if (state === "idle") {
        ctx.font = "13px monospace";
        ctx.fillStyle = isDark ? "rgba(134,239,172,0.35)" : "rgba(22,101,52,0.35)";
        ctx.textAlign = "center";
        ctx.fillText("2nd-order dynamics: PID controls angular acceleration", w / 2, h / 2 - 16);
        ctx.fillText("High Kp without Kd = oscillation! Kd dampens it.", w / 2, h / 2 + 6);
        ctx.fillText("Ki helps on sustained curves. Find the sweet spot!", w / 2, h / 2 + 28);
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [resolvedTheme]);

  const startSim = () => {
    const t = sim.current.track; if (t.length === 0) return;
    Object.assign(sim.current, {
      x: t[0].x, y: t[0].y,
      heading: Math.atan2(t[1].y - t[0].y, t[1].x - t[0].x),
      omega: 0, integral: 0, prevErr: 0, first: true,
      totErr: 0, steps: 0, nIdx: 0, laps: 0, offFrames: 0, trail: [],
    });
    setScore(null); setLaps(0); setGameState("running");
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)] aspect-[16/9]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" role="img" aria-label="PID line-following buggy with 2nd order dynamics" />
        {score !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-4xl font-bold text-[var(--color-accent)] mb-2">{score}/100</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {score === 0 ? "Off track! Balance Kp with Kd" : score >= 90 ? "Perfect tuning!" : score >= 75 ? "Great! Fine-tune for less wobble" : score >= 50 ? "Good start! Add Kd to dampen oscillation" : "Try Kp=1.5, Kd=0.8"}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <label className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider uppercase">Kp: {kp.toFixed(1)}</label>
          <input type="range" min={0} max={4} step={0.1} value={kp} onChange={(e) => setKp(parseFloat(e.target.value))} className="w-full mt-1" style={{ accentColor: "#86EFAC" }} />
          <span className="text-[10px] text-[var(--color-text-muted)]">Correction strength</span>
        </div>
        <div className="text-center">
          <label className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider uppercase">Ki: {ki.toFixed(2)}</label>
          <input type="range" min={0} max={0.5} step={0.01} value={ki} onChange={(e) => setKi(parseFloat(e.target.value))} className="w-full mt-1" style={{ accentColor: "#FCA5A5" }} />
          <span className="text-[10px] text-[var(--color-text-muted)]">Steady-state fix</span>
        </div>
        <div className="text-center">
          <label className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider uppercase">Kd: {kd.toFixed(1)}</label>
          <input type="range" min={0} max={3} step={0.1} value={kd} onChange={(e) => setKd(parseFloat(e.target.value))} className="w-full mt-1" style={{ accentColor: "#93C5FD" }} />
          <span className="text-[10px] text-[var(--color-text-muted)]">Oscillation damping</span>
        </div>
      </div>
      <button onClick={startSim} className="w-full py-3 rounded-lg font-semibold text-sm text-[#0c0a09] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors">
        {gameState === "running" ? "Running..." : score !== null ? "Try Again" : "Start Simulation"}
      </button>
    </div>
  );
}
