"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";

function project3D(x: number, y: number, z: number, camAz: number, camEl: number) {
  const ca = Math.cos(camAz), sa = Math.sin(camAz);
  const ce = Math.cos(camEl), se = Math.sin(camEl);
  const rx = x * ca + z * sa;
  const rz = -x * sa + z * ca;
  const ry = y * ce - rz * se;
  const rz2 = y * se + rz * ce;
  return { sx: rx * 2.2, sy: -ry * 2.2, depth: rz2 };
}

export function MonitorArmGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const { resolvedTheme } = useTheme();

  const [yaw, setYaw] = useState(0);
  const [height, setHeight] = useState(50);
  const [pitch, setPitch] = useState(0);
  const [targetPos, setTargetPos] = useState({ yaw: 0, height: 60, pitch: 0 });
  const [score, setScore] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);

  const camRef = useRef({ azimuth: 0.6, elevation: 0.4, dragging: false, lastX: 0, lastY: 0 });
  const yawRef = useRef(yaw); yawRef.current = yaw;
  const heightRef = useRef(height); heightRef.current = height;
  const pitchRef = useRef(pitch); pitchRef.current = pitch;
  const targetRef = useRef(targetPos); targetRef.current = targetPos;
  const roundRef = useRef(round); roundRef.current = round;
  const totalRef = useRef(totalScore); totalRef.current = totalScore;

  const randomTarget = useCallback(() => ({
    yaw: -60 + Math.random() * 120,
    height: 35 + Math.random() * 60,
    pitch: -30 + Math.random() * 60,
  }), []);

  useEffect(() => { setTargetPos(randomTarget()); }, [randomTarget]);

  const checkScore = useCallback(() => {
    const tp = targetRef.current;
    const err = Math.abs(yawRef.current - tp.yaw) + Math.abs(heightRef.current - tp.height) * 0.5 + Math.abs(pitchRef.current - tp.pitch);
    const s = Math.max(0, Math.round(100 - err));
    setScore(s);
    setTotalScore((prev) => prev + s);
  }, []);

  const nextRound = useCallback(() => {
    setTargetPos(randomTarget()); setScore(null); setRound((r) => r + 1);
    setYaw(-20 + Math.random() * 40); setHeight(40 + Math.random() * 30); setPitch(-10 + Math.random() * 20);
  }, [randomTarget]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onDown = (e: MouseEvent) => { camRef.current.dragging = true; camRef.current.lastX = e.clientX; camRef.current.lastY = e.clientY; };
    const onMove = (e: MouseEvent) => {
      if (!camRef.current.dragging) return;
      camRef.current.azimuth += (e.clientX - camRef.current.lastX) * 0.008;
      camRef.current.elevation = Math.max(-1.2, Math.min(1.2, camRef.current.elevation + (e.clientY - camRef.current.lastY) * 0.008));
      camRef.current.lastX = e.clientX; camRef.current.lastY = e.clientY;
    };
    const onUp = () => { camRef.current.dragging = false; };
    const onTouchStart = (e: TouchEvent) => { camRef.current.dragging = true; camRef.current.lastX = e.touches[0].clientX; camRef.current.lastY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      if (!camRef.current.dragging) return; e.preventDefault();
      camRef.current.azimuth += (e.touches[0].clientX - camRef.current.lastX) * 0.008;
      camRef.current.elevation = Math.max(-1.2, Math.min(1.2, camRef.current.elevation + (e.touches[0].clientY - camRef.current.lastY) * 0.008));
      camRef.current.lastX = e.touches[0].clientX; camRef.current.lastY = e.touches[0].clientY;
    };
    const onTouchEnd = () => { camRef.current.dragging = false; };

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    const isDark = resolvedTheme === "dark";
    const accent = "#86EFAC";
    const armColor = isDark ? "#86EFAC" : "#166534";
    const targetColor = "#FCA5A5";
    const groundColor = isDark ? "rgba(134,239,172,0.10)" : "rgba(22,101,52,0.08)";
    const gridColor = isDark ? "rgba(134,239,172,0.12)" : "rgba(22,101,52,0.08)";

    const animate = () => {
      // Dynamic resize
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect && (Math.abs(canvas.width / window.devicePixelRatio - rect.width) > 2)) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      }

      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      if (w < 50) { animRef.current = requestAnimationFrame(animate); return; }
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2, cy = h * 0.55;
      const cam = camRef.current;
      const proj = (x: number, y: number, z: number) => {
        const p = project3D(x, y, z, cam.azimuth, cam.elevation);
        return { sx: cx + p.sx, sy: cy + p.sy, depth: p.depth };
      };
      const line3D = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, col: string, lw: number) => {
        const a = proj(x1, y1, z1), b = proj(x2, y2, z2);
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();
      };
      const circ3D = (x: number, y: number, z: number, r: number, col: string, fill: boolean) => {
        const p = proj(x, y, z); ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        if (fill) { ctx.fillStyle = col; ctx.fill(); } else { ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke(); }
      };

      // Colored ground plane (filled quad)
      const gSize = 75;
      const gc = [proj(-gSize, 0, -gSize), proj(gSize, 0, -gSize), proj(gSize, 0, gSize), proj(-gSize, 0, gSize)];
      ctx.beginPath(); gc.forEach((c, i) => (i === 0 ? ctx.moveTo(c.sx, c.sy) : ctx.lineTo(c.sx, c.sy))); ctx.closePath();
      ctx.fillStyle = groundColor; ctx.fill();

      // Grid lines on ground
      for (let i = -3; i <= 3; i++) {
        line3D(i * 25, 0, -gSize, i * 25, 0, gSize, gridColor, 0.5);
        line3D(-gSize, 0, i * 25, gSize, 0, i * 25, gridColor, 0.5);
      }

      // XYZ Axes (colored)
      line3D(0, 0, 0, 50, 0, 0, "#FCA5A5", 1.5); // X = red
      line3D(0, 0, 0, 0, 50, 0, accent, 1.5);     // Y = green (up)
      line3D(0, 0, 0, 0, 0, 50, "#93C5FD", 1.5);  // Z = blue
      // Axis labels
      const xLbl = proj(55, 0, 0), yLbl = proj(0, 55, 0), zLbl = proj(0, 0, 55);
      ctx.font = "12px monospace"; ctx.textAlign = "center";
      ctx.fillStyle = "#FCA5A5"; ctx.fillText("X", xLbl.sx, xLbl.sy);
      ctx.fillStyle = accent; ctx.fillText("Y", yLbl.sx, yLbl.sy);
      ctx.fillStyle = "#93C5FD"; ctx.fillText("Z", zLbl.sx, zLbl.sy);

      const _y = yawRef.current, _h = heightRef.current, _p = pitchRef.current;
      const yr = (_y * Math.PI) / 180;

      // Base
      circ3D(0, 0, 0, 12, armColor, false); circ3D(0, 0, 0, 4, accent, true);

      // Vertical column (P joint)
      line3D(0, 0, 0, 0, _h, 0, armColor, 3);
      // Tick marks along column
      for (let t = 10; t < _h; t += 15) {
        const p = proj(0, t, 0);
        ctx.beginPath(); ctx.moveTo(p.sx - 3, p.sy); ctx.lineTo(p.sx + 3, p.sy);
        ctx.strokeStyle = accent; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.3; ctx.stroke(); ctx.globalAlpha = 1;
      }
      circ3D(0, _h, 0, 5, accent, true);

      // Horizontal arm (rotated by yaw)
      const armLen = 55;
      const ex = Math.sin(yr) * armLen, ez = Math.cos(yr) * armLen;
      line3D(0, _h, 0, ex, _h, ez, armColor, 2.5);
      circ3D(ex, _h, ez, 4, accent, true);

      // Monitor with PROPER PITCH ROTATION
      // The monitor rotates around the arm endpoint's local axis (perpendicular to the arm direction)
      // Pitch tilts the monitor forward/backward
      const pr = (_p * Math.PI) / 180;
      const mw = 28, mh = 18;
      // Local coordinate system at arm end:
      // armDir = (sin(yr), 0, cos(yr)) — direction arm extends
      // upDir = (0, 1, 0) — up
      // For pitch: rotate the monitor's up-down around the arm direction
      const cosPr = Math.cos(pr), sinPr = Math.sin(pr);
      // Monitor corners in local frame, then rotated to world
      // Local: width along cross(armDir, up), height along up, pitch rotates height into armDir
      const crossX = Math.cos(yr), crossZ = -Math.sin(yr); // perpendicular to arm in XZ plane

      // Proper pitch rotation: rotate monitor corners around arm endpoint
      // Pitch rotates in the plane defined by (up) and (arm direction)
      // armDir = (sin(yr), 0, cos(yr)), upDir = (0, 1, 0)
      const armDirX = Math.sin(yr), armDirZ = Math.cos(yr);
      const halfH = mh / 2;
      const corners3D = [[-mw/2, halfH], [mw/2, halfH], [mw/2, -halfH], [-mw/2, -halfH]].map(([lw, lh]) => {
        // lw = local width offset (along cross direction), lh = local height offset (rotated by pitch)
        const worldY = _h + lh * cosPr;            // height component (single cos, no double application)
        const fwd = lh * sinPr;                     // forward/backward displacement from pitch (full, no damping)
        return {
          x: ex + crossX * lw + armDirX * fwd,
          y: worldY,
          z: ez + crossZ * lw + armDirZ * fwd,      // cos(yr) not sin(yr) for Z component
        };
      });

      const screenCorners = corners3D.map((c) => proj(c.x, c.y, c.z));
      ctx.beginPath();
      screenCorners.forEach((c, i) => (i === 0 ? ctx.moveTo(c.sx, c.sy) : ctx.lineTo(c.sx, c.sy)));
      ctx.closePath();
      ctx.fillStyle = isDark ? "rgba(134,239,172,0.15)" : "rgba(22,101,52,0.08)";
      ctx.fill();
      ctx.strokeStyle = armColor; ctx.lineWidth = 2; ctx.stroke();

      // Screen "face" indicator (small line showing where screen faces)
      const faceDir = {
        x: ex + armDirX * sinPr * 15,
        y: _h,
        z: ez + armDirZ * sinPr * 15,
      };
      const faceScreen = proj(faceDir.x, faceDir.y, faceDir.z);
      const armScreen = proj(ex, _h, ez);
      ctx.beginPath(); ctx.moveTo(armScreen.sx, armScreen.sy); ctx.lineTo(faceScreen.sx, faceScreen.sy);
      ctx.strokeStyle = accent; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);

      // Target head
      const tp = targetRef.current;
      const tyr = (tp.yaw * Math.PI) / 180, td = 80;
      const tX = Math.sin(tyr) * td, tZ = Math.cos(tyr) * td, tY = tp.height;
      circ3D(tX, tY, tZ, 14, targetColor, false); circ3D(tX, tY, tZ, 5, targetColor, true);
      const ts = proj(tX, tY, tZ);
      ctx.font = "12px monospace"; ctx.fillStyle = targetColor; ctx.textAlign = "center"; ctx.fillText("HEAD", ts.sx, ts.sy + 24);

      // HUD
      ctx.font = "12px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.6)" : "rgba(22,101,52,0.7)";
      ctx.textAlign = "right"; ctx.fillText(`ROUND: ${roundRef.current}/5`, w - 10, 18); ctx.fillText(`TOTAL: ${totalRef.current}`, w - 10, 34);
      ctx.textAlign = "left"; ctx.fillText("R: YAW  P: HEIGHT  R: PITCH", 10, 18);
      ctx.fillStyle = isDark ? "rgba(134,239,172,0.3)" : "rgba(22,101,52,0.3)";
      ctx.textAlign = "center"; ctx.fillText("DRAG TO ORBIT \u2022 360\u00b0", w / 2, h - 10);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousedown", onDown); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", onTouchStart); canvas.removeEventListener("touchmove", onTouchMove); canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [resolvedTheme]);

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)] aspect-[16/10] cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" role="img" aria-label="3D monitor arm with 360 degree orbit camera" />
        {score !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-accent)] mb-1">{score}/100</p>
              <p className="text-sm text-[var(--color-text-muted)] mb-3">{score >= 80 ? "Perfect aim!" : score >= 50 ? "Close! Orbit to check." : "Orbit to check all axes"}</p>
              {round < 5 ? (
                <button onClick={nextRound} className="px-5 py-2 rounded-lg text-sm font-semibold text-[#0c0a09] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors">Next Round</button>
              ) : (
                <div><p className="text-lg font-bold text-[var(--color-text)]">Final: {totalScore}/500</p>
                <button onClick={() => { setRound(1); setTotalScore(0); nextRound(); }} className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold text-[#0c0a09] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors">Play Again</button></div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center"><label className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider uppercase">Yaw (R): {yaw}\u00b0</label>
        <input type="range" min={-90} max={90} value={yaw} onChange={(e) => setYaw(parseInt(e.target.value))} className="w-full mt-1" style={{ accentColor: "#86EFAC" }} /></div>
        <div className="text-center"><label className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider uppercase">Height (P): {height}</label>
        <input type="range" min={30} max={100} value={height} onChange={(e) => setHeight(parseInt(e.target.value))} className="w-full mt-1" style={{ accentColor: "#FCA5A5" }} /></div>
        <div className="text-center"><label className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider uppercase">Pitch (R): {pitch}\u00b0</label>
        <input type="range" min={-45} max={45} value={pitch} onChange={(e) => setPitch(parseInt(e.target.value))} className="w-full mt-1" style={{ accentColor: "#93C5FD" }} /></div>
      </div>
      {score === null && (
        <button onClick={checkScore} className="w-full py-2.5 rounded-lg font-semibold text-sm text-[#0c0a09] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors">Lock Position</button>
      )}
    </div>
  );
}
