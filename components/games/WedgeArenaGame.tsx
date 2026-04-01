"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";

interface Bot { x: number; y: number; vx: number; vy: number; angle: number; lifted: number; }

const ARENA_R = 220;
const HOLE_R = 42;
const HOLES = [
  { x: -ARENA_R * 0.55, y: ARENA_R * 0.55 },
  { x: ARENA_R * 0.55, y: -ARENA_R * 0.55 },
];
const BLADE_R = 16;
const FRICTION = 0.90;

export function WedgeArenaGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const { resolvedTheme } = useTheme();
  const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const gsRef = useRef(gameState); gsRef.current = gameState;
  const psRef = useRef(playerScore); psRef.current = playerScore;
  const asRef = useRef(aiScore); asRef.current = aiScore;
  const heartsRef = useRef(hearts); heartsRef.current = hearts;

  const keysRef = useRef(new Set<string>());
  const playerRef = useRef<Bot>({ x: -80, y: 0, vx: 0, vy: 0, angle: 0, lifted: 0 });
  const aiRef = useRef<Bot>({ x: 80, y: 0, vx: 0, vy: 0, angle: Math.PI, lifted: 0 });
  const bladeAngleRef = useRef(0);
  const aiStateRef = useRef<"circle" | "charge" | "evade">("circle");
  const aiTimerRef = useRef(0);
  const bladeCooldownRef = useRef(0); // prevent blade multi-hit

  const resetBots = useCallback(() => {
    playerRef.current = { x: -80, y: 0, vx: 0, vy: 0, angle: 0, lifted: 0 };
    aiRef.current = { x: 80, y: 0, vx: 0, vy: 0, angle: Math.PI, lifted: 0 };
    bladeAngleRef.current = 0;
    aiStateRef.current = "circle";
    aiTimerRef.current = 0;
    bladeCooldownRef.current = 0;
  }, []);

  const startGame = useCallback(() => {
    resetBots();
    setHearts(3);
    setPlayerScore(0);
    setAiScore(0);
    setGameState("playing");
  }, [resetBots]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(k)) {
        e.preventDefault(); keysRef.current.add(k);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isDark = resolvedTheme === "dark";

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
      if (w < 100) { animRef.current = requestAnimationFrame(animate); return; }
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2;
      const scale = Math.min(w, h) / (ARENA_R * 2.5);
      const ts = (wx: number, wy: number) => ({ sx: cx + wx * scale, sy: cy + wy * scale });
      const sr = (r: number) => r * scale;

      // Arena
      ctx.beginPath(); ctx.arc(cx, cy, sr(ARENA_R), 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "rgba(134,239,172,0.03)" : "rgba(22,101,52,0.02)"; ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(134,239,172,0.25)" : "rgba(22,101,52,0.15)"; ctx.lineWidth = 3; ctx.stroke();
      // Danger ring
      ctx.beginPath(); ctx.arc(cx, cy, sr(ARENA_R - 20), 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? "rgba(252,211,77,0.1)" : "rgba(180,83,9,0.06)"; ctx.lineWidth = sr(20); ctx.stroke();

      // Pits
      HOLES.forEach((hole) => {
        const hs = ts(hole.x, hole.y);
        // Pit shadow
        ctx.beginPath(); ctx.arc(hs.sx, hs.sy, sr(HOLE_R + 4), 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.08)"; ctx.fill();
        // Pit
        ctx.beginPath(); ctx.arc(hs.sx, hs.sy, sr(HOLE_R), 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.35)"; ctx.fill();
        ctx.strokeStyle = isDark ? "rgba(252,165,165,0.4)" : "rgba(220,38,38,0.25)"; ctx.lineWidth = 2; ctx.stroke();
        ctx.font = sr(10) + "px monospace"; ctx.fillStyle = isDark ? "rgba(252,165,165,0.5)" : "rgba(220,38,38,0.4)";
        ctx.textAlign = "center"; ctx.fillText("PIT", hs.sx, hs.sy + sr(4));
      });

      const state = gsRef.current;
      const p = playerRef.current;
      const ai = aiRef.current;

      if (state === "playing") {
        bladeAngleRef.current += 0.2;
        if (bladeCooldownRef.current > 0) bladeCooldownRef.current--;
        // When lifted, AI sticks to player — gets pushed along
        if (ai.lifted > 0) {
          const sepDx = p.x - ai.x, sepDy = p.y - ai.y;
          const sepDist = Math.sqrt(sepDx * sepDx + sepDy * sepDy);
          if (sepDist > 50) {
            ai.lifted = 0; // release when player backs away
          } else if (sepDist < 30) {
            // Stick: AI follows player movement
            ai.x += p.vx * 0.9;
            ai.y += p.vy * 0.9;
          }
        }

        // Player input (slower)
        const keys = keysRef.current;
        const accel = 0.12;
        if (keys.has("w") || keys.has("arrowup")) { p.vx += Math.cos(p.angle) * accel; p.vy += Math.sin(p.angle) * accel; }
        if (keys.has("s") || keys.has("arrowdown")) { p.vx -= Math.cos(p.angle) * accel * 0.4; p.vy -= Math.sin(p.angle) * accel * 0.4; }
        if (keys.has("a") || keys.has("arrowleft")) p.angle -= 0.045;
        if (keys.has("d") || keys.has("arrowright")) p.angle += 0.045;

        // AI
        aiTimerRef.current++;
        const dxP = p.x - ai.x, dyP = p.y - ai.y;
        const distP = Math.sqrt(dxP * dxP + dyP * dyP);
        const angleToP = Math.atan2(dyP, dxP);

        if (aiTimerRef.current % 160 === 0) {
          if (distP < 70 && Math.random() > 0.75) aiStateRef.current = "charge";
          else if (Math.sqrt(ai.x * ai.x + ai.y * ai.y) > ARENA_R * 0.65) aiStateRef.current = "evade";
          else aiStateRef.current = Math.random() > 0.5 ? "circle" : "charge";
        }

        let targetAngle = angleToP;
        if (aiStateRef.current === "circle") targetAngle = angleToP + Math.PI / 3.5;
        else if (aiStateRef.current === "evade") targetAngle = Math.atan2(-ai.y, -ai.x);
        let ad = targetAngle - ai.angle;
        while (ad > Math.PI) ad -= Math.PI * 2; while (ad < -Math.PI) ad += Math.PI * 2;
        if (ai.lifted === 0) ai.angle += ad * 0.02;

        const aiSpeed = ai.lifted > 0 ? 0 : 0.05; // SLOW when lifted!
        if (ai.lifted > 0) { ai.vx *= 0.8; ai.vy *= 0.8; } else { ai.vx += Math.cos(ai.angle) * aiSpeed; }
        if (ai.lifted === 0) ai.vy += Math.sin(ai.angle) * aiSpeed;

        // Physics
        p.vx *= FRICTION; p.vy *= FRICTION;
        ai.vx *= FRICTION; ai.vy *= FRICTION;
        p.x += p.vx; p.y += p.vy;
        ai.x += ai.vx; ai.y += ai.vy;

        // Body collision: wedge vs AI
        const cdx = p.x - ai.x, cdy = p.y - ai.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        const minDist = 24;
        if (cdist < minDist && cdist > 0.1) {
          const nx = cdx / cdist, ny = cdy / cdist;
          const overlap = minDist - cdist;

          // Check if player is attacking from SIDE or BACK (not blade front)
          const attackAngle = Math.atan2(-ny, -nx); // direction from player to AI
          let relAngle = attackAngle - ai.angle;
          while (relAngle > Math.PI) relAngle -= Math.PI * 2;
          while (relAngle < -Math.PI) relAngle += Math.PI * 2;
          const hittingFront = Math.abs(relAngle) < Math.PI / 3; // front 120 degrees

          if (!hittingFront) {
            // Side/back attack — LIFT the opponent!
            ai.lifted = 70; // lifted for 45 frames (slowed)
            const pushMult = 2.0;
            ai.vx -= nx * 0.7 * pushMult; ai.vy -= ny * 0.7 * pushMult;
            // player stays in contact — no pushback
          } else {
            // Front collision — mutual push
            ai.vx -= nx * 0.2; ai.vy -= ny * 0.2;
            p.vx += nx * 0.15; p.vy += ny * 0.15;
          }
          p.x += nx * overlap * 0.4; p.y += ny * overlap * 0.4;
          ai.x -= nx * overlap * 0.6; ai.y -= ny * overlap * 0.6;
        }

        // Blade collision — both bounce off, player loses a heart
        const bladeCx = ai.x + Math.cos(ai.angle) * 16;
        const bladeCy = ai.y + Math.sin(ai.angle) * 16;
        const bDx = p.x - bladeCx, bDy = p.y - bladeCy;
        const bDist = Math.sqrt(bDx * bDx + bDy * bDy);
        if (bDist < BLADE_R + 10 && bladeCooldownRef.current === 0) {
          // Both bounce off — high energy from spinning motor
          const kx = bDx / (bDist || 1), ky = bDy / (bDist || 1);
          p.vx += kx * 4.0; p.vy += ky * 4.0;     // player knocked back
          ai.vx -= kx * 4.0; ai.vy -= ky * 4.0;    // AI also knocked back
          bladeCooldownRef.current = 30; // cooldown to prevent multi-hit
          const newHearts = heartsRef.current - 1;
          setHearts(newHearts);
          if (newHearts <= 0) { setGameState("lost"); }
        }

        // Arena boundary
        const pDist = Math.sqrt(p.x * p.x + p.y * p.y);
        if (pDist > ARENA_R - 12) {
          const nx = p.x / pDist, ny = p.y / pDist;
          p.x = nx * (ARENA_R - 12); p.y = ny * (ARENA_R - 12);
          p.vx -= nx * 0.3; p.vy -= ny * 0.3;
        }
        const aiDist = Math.sqrt(ai.x * ai.x + ai.y * ai.y);
        if (aiDist > ARENA_R - 12) {
          const nx = ai.x / aiDist, ny = ai.y / aiDist;
          ai.x = nx * (ARENA_R - 12); ai.y = ny * (ARENA_R - 12);
          ai.vx -= nx * 0.3; ai.vy -= ny * 0.3;
        }

        // Pit check
        HOLES.forEach((hole) => {
          if (Math.sqrt((ai.x - hole.x) ** 2 + (ai.y - hole.y) ** 2) < HOLE_R - 5) {
            setPlayerScore((s) => { const n = s + 1; if (n >= 3) setGameState("won"); return n; });
            resetBots();
          }
          if (Math.sqrt((p.x - hole.x) ** 2 + (p.y - hole.y) ** 2) < HOLE_R - 5) {
            setGameState("lost"); // instant kill
          }
        });
      }

      // Draw player (rounded wedge shape)
      const ps = ts(p.x, p.y);
      ctx.save(); ctx.translate(ps.sx, ps.sy); ctx.rotate(p.angle);
      ctx.beginPath();
      ctx.moveTo(sr(13), 0); // front tip
      ctx.quadraticCurveTo(sr(10), sr(-9), sr(-8), sr(-11)); // top curve
      ctx.quadraticCurveTo(sr(-12), sr(-8), sr(-12), 0);    // back-top
      ctx.quadraticCurveTo(sr(-12), sr(8), sr(-8), sr(11));  // back-bottom
      ctx.quadraticCurveTo(sr(10), sr(9), sr(13), 0);        // bottom curve
      ctx.closePath();
      ctx.fillStyle = isDark ? "rgba(134,239,172,0.25)" : "rgba(22,101,52,0.12)";
      ctx.fill();
      ctx.strokeStyle = isDark ? "#86EFAC" : "#166534";
      ctx.lineWidth = 2.5; ctx.stroke();
      // Front edge (the wedge lip)
      ctx.beginPath(); ctx.arc(sr(10), 0, sr(5), -0.8, 0.8);
      ctx.strokeStyle = isDark ? "#86EFAC" : "#166534"; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();

      // Draw AI (square with spinning blade)
      const ais = ts(ai.x, ai.y);
      ctx.save(); ctx.translate(ais.sx, ais.sy); ctx.rotate(ai.angle);
      // Lifted effect
      if (ai.lifted > 0) {
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(ai.lifted * 0.5);
      }
      ctx.fillStyle = isDark ? "rgba(252,165,165,0.2)" : "rgba(220,38,38,0.1)";
      ctx.fillRect(sr(-12), sr(-12), sr(24), sr(24));
      ctx.strokeStyle = isDark ? "#FCA5A5" : "#dc2626";
      ctx.lineWidth = 2; ctx.strokeRect(sr(-12), sr(-12), sr(24), sr(24));
      if (ai.lifted > 0) {
        ctx.font = sr(8) + "px monospace"; ctx.fillStyle = "#FCD34D"; ctx.textAlign = "center";
        ctx.fillText("LIFTED!", 0, sr(-16));
      }
      ctx.globalAlpha = 1;
      // Blade
      ctx.save(); ctx.translate(sr(16), 0); ctx.rotate(bladeAngleRef.current);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const ba = (i / 4) * Math.PI * 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ba) * sr(BLADE_R), Math.sin(ba) * sr(BLADE_R));
      }
      ctx.strokeStyle = isDark ? "#FCA5A5" : "#dc2626"; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, sr(BLADE_R), 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? "rgba(252,165,165,0.2)" : "rgba(220,38,38,0.15)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, sr(3), 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "#FCA5A5" : "#dc2626"; ctx.fill();
      ctx.restore();
      ctx.restore();

      // Labels
      ctx.font = sr(9) + "px monospace";
      ctx.fillStyle = isDark ? "#86EFAC" : "#166534"; ctx.textAlign = "center";
      ctx.fillText("SPACE SHIP", ps.sx, ps.sy - sr(16));
      ctx.fillStyle = isDark ? "#FCA5A5" : "#dc2626";
      ctx.fillText("BLADE BOT", ais.sx, ais.sy - sr(18));

      // HUD — score
      ctx.font = "15px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.8)" : "rgba(22,101,52,0.9)";
      ctx.textAlign = "center";
      ctx.fillText("YOU: " + psRef.current + "  \u2014  AI: " + asRef.current, cx, 22);

      // Hearts
      ctx.font = "16px sans-serif"; ctx.textAlign = "left";
      const heartStr = "\u2764\uFE0F".repeat(heartsRef.current) + "\uD83D\uDDA4".repeat(3 - heartsRef.current);
      ctx.fillText(heartStr, 12, 22);

      ctx.font = "10px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.25)" : "rgba(22,101,52,0.25)";
      ctx.textAlign = "center"; ctx.fillText("FIRST TO 3 PIT KILLS \u2022 3 HEARTS VS BLADE", cx, 38);

      if (state === "idle") {
        ctx.font = "13px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.35)" : "rgba(22,101,52,0.35)";
        ctx.textAlign = "center";
        ctx.fillText("WASD to drive \u2022 Wedge under from side/back to LIFT", cx, h - 30);
        ctx.fillText("Blade hits = lose a heart \u2022 Pit = instant KO!", cx, h - 14);
      }

      if (state === "won" || state === "lost") {
        ctx.fillStyle = isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)"; ctx.fillRect(0, 0, w, h);
        ctx.font = "26px monospace"; ctx.textAlign = "center";
        ctx.fillStyle = state === "won" ? (isDark ? "#86EFAC" : "#166534") : "#FCA5A5";
        ctx.fillText(state === "won" ? "SPACE SHIP WINS!" : "BLADE BOT WINS!", cx, cy - 8);
        ctx.font = "13px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.5)" : "rgba(22,101,52,0.5)";
        ctx.fillText("Click 'New Match' to play again", cx, cy + 18);
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [resolvedTheme, resetBots]);

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)] aspect-square max-h-[520px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" role="img"
          aria-label="Space Ship combat robot arena" />
      </div>
      <button onClick={startGame}
        className="w-full py-3 rounded-lg font-semibold text-sm text-[#0c0a09] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors">
        {gameState === "idle" ? "Start Match" : "New Match"}
      </button>
      <div className="grid grid-cols-4 gap-1 max-w-[180px] mx-auto md:hidden">
        <div />
        <button onTouchStart={() => keysRef.current.add("w")} onTouchEnd={() => keysRef.current.delete("w")}
          className="p-4 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center text-xs font-mono active:bg-[var(--color-accent)]/20">{"\u25B2"}</button>
        <div /><div />
        <button onTouchStart={() => keysRef.current.add("a")} onTouchEnd={() => keysRef.current.delete("a")}
          className="p-4 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center text-xs font-mono active:bg-[var(--color-accent)]/20">{"\u25C0"}</button>
        <button onTouchStart={() => keysRef.current.add("s")} onTouchEnd={() => keysRef.current.delete("s")}
          className="p-4 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center text-xs font-mono active:bg-[var(--color-accent)]/20">{"\u25BC"}</button>
        <button onTouchStart={() => keysRef.current.add("d")} onTouchEnd={() => keysRef.current.delete("d")}
          className="p-4 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center text-xs font-mono active:bg-[var(--color-accent)]/20">{"\u25B6"}</button>
        <div />
      </div>
    </div>
  );
}
