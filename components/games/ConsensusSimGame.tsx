"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";

// Multi-Robot Navigation: DAF vs APF vs CBF comparison
// From Billy's research notebooks (MRDAF_Simulations.ipynb, ORCA_CBF_DAF_Comparison.ipynb)

type Algorithm = "DAF" | "APF" | "CBF";

const K_GOAL = 1.0;
const K2 = 2.0;
const K3 = 20.0;
const EPS1 = 0.4;
const EPS2 = 2.0;
const R_ROBOT = 0.3;
const R_OBS = 0.8;
const GOAL = { x: 4, y: 0 };
const OBSTACLE = { x: 0, y: 0 };

// APF parameters (from Master_Collision_Avoidance_Comparison.py)
const K_R_APF = 3.0;
const EPS2_APF = 2.0;

// CBF parameters (from ORCA_CBF_DAF_Comparison.ipynb)
const D_MIN_CBF = 0.8;
const A1_CBF = 10.0;
const A2_CBF = 6.0;

const INITIAL_POSITIONS = [
  { x: -4, y: -1.5 }, { x: -4, y: -0.5 },
  { x: -4, y: 0.5 }, { x: -4, y: 1.5 },
];

// DAF smoothstep gamma
function gamma(d: number): number {
  if (d >= EPS2) return 0;
  if (d < EPS1) return 1 / EPS1;
  const t = (d - EPS1) / (EPS2 - EPS1);
  return (1 / EPS1) * (1 - 3 * t * t + 2 * t * t * t);
}

interface RobotState { px: number; py: number; vx: number; vy: number; }

function computeAccel(robots: RobotState[], i: number, algo: Algorithm): { ax: number; ay: number } {
  const r = robots[i];
  // Goal-seeking + damping (common to all)
  let ax = -K_GOAL * (r.px - GOAL.x) - K2 * r.vx;
  let ay = -K_GOAL * (r.py - GOAL.y) - K2 * r.vy;

  if (algo === "DAF") {
    // Inter-robot DAF avoidance
    for (let j = 0; j < robots.length; j++) {
      if (j === i) continue;
      const dx = r.px - robots[j].px, dy = r.py - robots[j].py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const surfDist = dist - 2 * R_ROBOT;
      if (surfDist >= EPS2 || dist < 0.001) continue;
      const nx = dx / dist, ny = dy / dist;
      const vDotN = nx * r.vx + ny * r.vy;
      const g = gamma(surfDist);
      const brake = Math.min(vDotN, 0);
      ax -= K3 * g * nx * brake;
      ay -= K3 * g * ny * brake;
    }
    // Obstacle DAF
    const odx = r.px - OBSTACLE.x, ody = r.py - OBSTACLE.y;
    const oDist = Math.sqrt(odx * odx + ody * ody);
    const oSurf = oDist - R_OBS - R_ROBOT;
    if (oSurf < EPS2 && oDist > 0.001) {
      const onx = odx / oDist, ony = ody / oDist;
      const ovn = onx * r.vx + ony * r.vy;
      ax -= K3 * gamma(oSurf) * onx * Math.min(ovn, 0);
      ay -= K3 * gamma(oSurf) * ony * Math.min(ovn, 0);
    }
  } else if (algo === "APF") {
    // APF: repulsive force F_r = k_r * (1/d - 1/eps2) * (1/d^2) * eta
    for (let j = 0; j < robots.length; j++) {
      if (j === i) continue;
      const dx = r.px - robots[j].px, dy = r.py - robots[j].py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const d = Math.max(dist - 2 * R_ROBOT, 0.05);
      if (d >= EPS2_APF) continue;
      const nx = dx / dist, ny = dy / dist;
      const force = K_R_APF * (1 / d - 1 / EPS2_APF) * (1 / (d * d));
      ax += force * nx;
      ay += force * ny;
    }
    // Obstacle APF
    const odx = r.px - OBSTACLE.x, ody = r.py - OBSTACLE.y;
    const oDist = Math.sqrt(odx * odx + ody * ody);
    const d = Math.max(oDist - R_OBS - R_ROBOT, 0.05);
    if (d < EPS2_APF) {
      const onx = odx / oDist, ony = ody / oDist;
      const force = K_R_APF * (1 / d - 1 / EPS2_APF) * (1 / (d * d));
      ax += force * onx;
      ay += force * ony;
    }
  } else if (algo === "CBF") {
    // CBF: QP-based barrier constraint (simplified sequential projection)
    // For each pair, enforce h = ||pi-pj||^2 - d_min^2 >= 0
    for (let j = 0; j < robots.length; j++) {
      if (j === i) continue;
      const dx = r.px - robots[j].px, dy = r.py - robots[j].py;
      const dist2 = dx * dx + dy * dy;
      const dist = Math.sqrt(dist2);
      const h = dist2 - D_MIN_CBF * D_MIN_CBF;
      const hdot = 2 * (dx * (r.vx - robots[j].vx) + dy * (r.vy - robots[j].vy));
      const rhs = -(A1_CBF / 2) * (hdot + A2_CBF * h);
      // Current acceleration contribution to constraint
      const Ax = 2 * dx, Ay = 2 * dy;
      const current = Ax * ax + Ay * ay;
      if (current < rhs && dist > 0.001) {
        const Anorm2 = Ax * Ax + Ay * Ay;
        const lambda = Math.max(0, (rhs - current) / Anorm2);
        ax += lambda * Ax;
        ay += lambda * Ay;
      }
    }
    // Obstacle CBF
    const odx = r.px - OBSTACLE.x, ody = r.py - OBSTACLE.y;
    const dist2 = odx * odx + ody * ody;
    const dmin_obs = R_OBS + R_ROBOT + 0.12;
    const h = dist2 - dmin_obs * dmin_obs;
    const hdot = 2 * (odx * r.vx + ody * r.vy);
    const rhs = -(A1_CBF / 2) * (hdot + A2_CBF * h);
    const Ax = 2 * odx, Ay = 2 * ody;
    const current = Ax * ax + Ay * ay;
    if (current < rhs) {
      const Anorm2 = Ax * Ax + Ay * Ay;
      if (Anorm2 > 0.001) {
        const lambda = Math.max(0, (rhs - current) / Anorm2);
        ax += lambda * Ax;
        ay += lambda * Ay;
      }
    }
  }

  return { ax, ay };
}

export function ConsensusSimGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const { resolvedTheme } = useTheme();

  const [algorithm, setAlgorithm] = useState<Algorithm>("DAF");
  const [simRunning, setSimRunning] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const runningRef = useRef(false);
  const algoRef = useRef<Algorithm>("DAF"); algoRef.current = algorithm;

  const robotsRef = useRef<RobotState[]>([]);
  const trailsRef = useRef<{ x: number; y: number }[][]>([[], [], [], []]);
  const lastTimeRef = useRef(0);
  const simTimeRef = useRef(0);

  const resetSim = useCallback(() => {
    robotsRef.current = INITIAL_POSITIONS.map((p) => ({ px: p.x, py: p.y, vx: 0, vy: 0 }));
    trailsRef.current = [[], [], [], []];
    simTimeRef.current = 0;
    lastTimeRef.current = performance.now();
    setSimTime(0);
    setSimRunning(true);
    runningRef.current = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const isDark = resolvedTheme === "dark";
    const robotColors = ["#86EFAC", "#FCA5A5", "#93C5FD", "#FCD34D"];
    const obsColor = isDark ? "rgba(255,100,100,0.3)" : "rgba(220,38,38,0.15)";
    const accent = "#86EFAC";

    const toScreen = (wx: number, wy: number, w: number, h: number) => {
      const scale = Math.min(w, h) / 12;
      return { sx: w / 2 + wx * scale, sy: h / 2 - wy * scale };
    };
    const worldR = (r: number, w: number, h: number) => r * Math.min(w, h) / 12;

    const animate = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      if (w < 10) { animRef.current = requestAnimationFrame(animate); return; }
      ctx.clearRect(0, 0, w, h);

      if (runningRef.current) {
        const now = performance.now();
        const wallDt = Math.min((now - lastTimeRef.current) / 1000, 0.03);
        lastTimeRef.current = now;
        const subSteps = 5, dt = wallDt / subSteps;
        for (let s = 0; s < subSteps; s++) {
          const accels = robotsRef.current.map((_, i) => computeAccel(robotsRef.current, i, algoRef.current));
          robotsRef.current.forEach((r, i) => {
            r.vx += accels[i].ax * dt; r.vy += accels[i].ay * dt;
            r.px += r.vx * dt; r.py += r.vy * dt;
          });
        }
        simTimeRef.current += wallDt;
        setSimTime(simTimeRef.current);
        robotsRef.current.forEach((r, i) => {
          trailsRef.current[i].push({ x: r.px, y: r.py });
          if (trailsRef.current[i].length > 600) trailsRef.current[i].shift();
        });
        if (robotsRef.current.every((r) => Math.hypot(r.px - GOAL.x, r.py - GOAL.y) < 0.3 && Math.hypot(r.vx, r.vy) < 0.1) && simTimeRef.current > 2) {
          runningRef.current = false; setSimRunning(false);
        }
      }

      // Grid
      ctx.globalAlpha = 0.06;
      for (let gx = -5; gx <= 5; gx++) { const p1 = toScreen(gx, -4, w, h), p2 = toScreen(gx, 4, w, h); ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.strokeStyle = accent; ctx.lineWidth = 0.5; ctx.stroke(); }
      for (let gy = -3; gy <= 3; gy++) { const p1 = toScreen(-6, gy, w, h), p2 = toScreen(6, gy, w, h); ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.strokeStyle = accent; ctx.lineWidth = 0.5; ctx.stroke(); }
      ctx.globalAlpha = 1;

      // Obstacle
      const obs = toScreen(OBSTACLE.x, OBSTACLE.y, w, h);
      ctx.beginPath(); ctx.arc(obs.sx, obs.sy, worldR(R_OBS, w, h), 0, Math.PI * 2);
      ctx.fillStyle = obsColor; ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(255,100,100,0.5)" : "rgba(220,38,38,0.3)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = "12px monospace"; ctx.fillStyle = isDark ? "rgba(255,100,100,0.6)" : "rgba(220,38,38,0.5)";
      ctx.textAlign = "center"; ctx.fillText("OBS", obs.sx, obs.sy + 4);

      // Goal
      const goal = toScreen(GOAL.x, GOAL.y, w, h);
      ctx.beginPath(); ctx.arc(goal.sx, goal.sy, 8, 0, Math.PI * 2);
      ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(goal.sx, goal.sy, 3, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.fill();
      ctx.fillText("GOAL", goal.sx, goal.sy + 20);

      // Start positions
      INITIAL_POSITIONS.forEach((p, i) => {
        const sp = toScreen(p.x, p.y, w, h);
        ctx.beginPath(); ctx.arc(sp.sx, sp.sy, 4, 0, Math.PI * 2);
        ctx.strokeStyle = robotColors[i]; ctx.lineWidth = 1; ctx.globalAlpha = 0.3; ctx.stroke(); ctx.globalAlpha = 1;
      });

      // Trails
      trailsRef.current.forEach((trail, i) => {
        if (trail.length < 2) return;
        ctx.beginPath();
        trail.forEach((p, j) => { const sp = toScreen(p.x, p.y, w, h); j === 0 ? ctx.moveTo(sp.sx, sp.sy) : ctx.lineTo(sp.sx, sp.sy); });
        ctx.strokeStyle = robotColors[i]; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.4; ctx.stroke(); ctx.globalAlpha = 1;
      });

      // Robots
      const rr = worldR(R_ROBOT, w, h);
      robotsRef.current.forEach((r, i) => {
        const sp = toScreen(r.px, r.py, w, h);
        ctx.beginPath(); ctx.arc(sp.sx, sp.sy, rr, 0, Math.PI * 2);
        ctx.fillStyle = robotColors[i]; ctx.globalAlpha = 0.2; ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = robotColors[i]; ctx.lineWidth = 2; ctx.stroke();
        ctx.font = "12px monospace"; ctx.fillStyle = robotColors[i]; ctx.textAlign = "center";
        ctx.fillText(`R${i + 1}`, sp.sx, sp.sy - rr - 6);
      });

      // HUD
      ctx.font = "12px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.6)" : "rgba(22,101,52,0.7)";
      ctx.textAlign = "left";
      ctx.fillText(`${algoRef.current} NAVIGATION`, 10, 18);
      ctx.fillText(`TIME: ${simTimeRef.current.toFixed(1)}s`, 10, 34);
      ctx.textAlign = "right";
      if (!runningRef.current && simTimeRef.current > 2) {
        ctx.fillStyle = accent; ctx.fillText("GOAL REACHED", w - 10, 18);
        ctx.fillText(`${simTimeRef.current.toFixed(1)}s`, w - 10, 34);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [resolvedTheme]);

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)] aspect-[16/9]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" role="img"
          aria-label="Multi-robot navigation comparing DAF, APF, and CBF collision avoidance algorithms" />
      </div>

      {/* Algorithm selector */}
      <div>
        <label className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider uppercase block mb-2">
          Algorithm
        </label>
        <div className="flex gap-2">
          {(["DAF", "APF", "CBF"] as Algorithm[]).map((a) => (
            <button key={a} onClick={() => setAlgorithm(a)}
              className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors
                ${algorithm === a
                  ? "bg-[var(--color-accent)] text-[#0c0a09] font-bold"
                  : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]"
                }`}>
              {a}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          {algorithm === "DAF" && "Dissipative Avoidance Feedback — velocity-dependent braking, smoothest trajectories."}
          {algorithm === "APF" && "Artificial Potential Fields — position-only repulsive forces, can oscillate near obstacles."}
          {algorithm === "CBF" && "Control Barrier Functions — QP-based hard safety constraints, guaranteed collision-free."}
        </p>
      </div>

      <button onClick={resetSim}
        className="w-full py-2.5 rounded-lg font-semibold text-sm text-[#0c0a09] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors">
        {simRunning ? "Restart" : simTime > 0 ? `Run ${algorithm} Again` : `Start ${algorithm} Simulation`}
      </button>
    </div>
  );
}
