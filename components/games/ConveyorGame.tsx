"use client";

import { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";

// Interactive demo showing how GridBox detects weight via motor current
// User drops objects onto conveyor → system auto-detects heavy vs light from current spike

interface Item { x: number; y: number; heavy: boolean; falling: boolean; vy: number; detected: boolean; sorted: boolean; sortDir: number; }

export function ConveyorGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const { resolvedTheme } = useTheme();
  const [gameState, setGameState] = useState<"idle" | "running">("idle");
  const gsRef = useRef(gameState); gsRef.current = gameState;
  const itemsRef = useRef<Item[]>([]);
  const currentRef = useRef(0.5); // baseline motor current (amps)
  const currentHistoryRef = useRef<number[]>(new Array(200).fill(0.5));
  const beltRef = useRef(0);
  const sortedRef = useRef({ heavy: 0, light: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isDark = resolvedTheme === "dark";

    // Click to drop item
    const onClick = (e: MouseEvent) => {
      if (gsRef.current !== "running") return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const w = rect.width;
      const hopperCenter = w * 0.15;
      // Only drop if clicking near hopper area
      if (cx < hopperCenter + 60 && cx > hopperCenter - 60) {
        const heavy = Math.random() > 0.5;
        itemsRef.current.push({
          x: hopperCenter, y: 30, heavy, falling: true, vy: 0,
          detected: false, sorted: false, sortDir: 0,
        });
      }
    };
    canvas.addEventListener("click", onClick);

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

      const state = gsRef.current;
      const cY = h * 0.45; // conveyor belt Y
      const cL = w * 0.05, cR = w * 0.7;
      const cLen = cR - cL;
      const hopX = w * 0.15;
      const sensorX = cL + cLen * 0.4; // current sensor position
      const sorterX = cL + cLen * 0.75;
      const motorX = cR + 10;
      const graphL = w * 0.72, graphR = w * 0.97, graphT = h * 0.08, graphB = h * 0.45;
      const binHeavyX = sorterX - 30, binLightX = sorterX + 30, binY = h * 0.72;

      // === DRAW ===

      // Conveyor frame
      ctx.fillStyle = isDark ? "rgba(134,239,172,0.04)" : "rgba(22,101,52,0.02)";
      ctx.fillRect(cL, cY - 5, cLen, 20);
      ctx.strokeStyle = isDark ? "rgba(134,239,172,0.2)" : "rgba(22,101,52,0.12)";
      ctx.lineWidth = 1.5; ctx.strokeRect(cL, cY - 5, cLen, 20);

      // Belt texture
      if (state === "running") beltRef.current = (beltRef.current + 0.6) % 10;
      ctx.strokeStyle = isDark ? "rgba(134,239,172,0.07)" : "rgba(22,101,52,0.035)"; ctx.lineWidth = 1;
      for (let bx = cL + beltRef.current; bx < cR; bx += 10) {
        ctx.beginPath(); ctx.moveTo(bx, cY); ctx.lineTo(bx, cY + 10); ctx.stroke();
      }

      // Rollers
      [0.02, 0.2, 0.4, 0.6, 0.8, 0.98].forEach((t) => {
        ctx.beginPath(); ctx.arc(cL + t * cLen, cY + 17, 4, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? "rgba(134,239,172,0.15)" : "rgba(22,101,52,0.08)"; ctx.lineWidth = 1.5; ctx.stroke();
      });

      // Motor
      ctx.beginPath(); ctx.arc(motorX, cY + 5, 14, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "rgba(134,239,172,0.06)" : "rgba(22,101,52,0.03)"; ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(134,239,172,0.2)" : "rgba(22,101,52,0.12)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.font = "8px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.35)" : "rgba(22,101,52,0.25)";
      ctx.textAlign = "center"; ctx.fillText("DC MOTOR", motorX, cY + 30);

      // Hopper
      ctx.beginPath();
      ctx.moveTo(hopX - 35, cY - 65); ctx.lineTo(hopX + 35, cY - 65);
      ctx.lineTo(hopX + 10, cY - 15); ctx.lineTo(hopX - 10, cY - 15); ctx.closePath();
      ctx.fillStyle = isDark ? "rgba(134,239,172,0.04)" : "rgba(22,101,52,0.02)"; ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(134,239,172,0.2)" : "rgba(22,101,52,0.12)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = "9px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.4)" : "rgba(22,101,52,0.3)";
      ctx.fillText("HOPPER", hopX, cY - 72);
      if (state === "running") {
        ctx.font = "8px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.25)" : "rgba(22,101,52,0.2)";
        ctx.fillText("(click to drop)", hopX, cY - 82);
      }

      // Current sensor marker on belt
      ctx.beginPath(); ctx.moveTo(sensorX, cY - 8); ctx.lineTo(sensorX, cY + 22);
      ctx.strokeStyle = isDark ? "#FCD34D" : "#b45309"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = "8px monospace"; ctx.fillStyle = isDark ? "#FCD34D" : "#b45309"; ctx.textAlign = "center";
      ctx.fillText("CURRENT", sensorX, cY - 12);
      ctx.fillText("SENSOR", sensorX, cY + 32);

      // Sorter flap
      const lastSorted = itemsRef.current.filter(i => i.sorted).slice(-1)[0];
      const flapAngle = lastSorted ? (lastSorted.heavy ? -0.5 : 0.5) : 0;
      ctx.save(); ctx.translate(sorterX, cY + 10);
      ctx.rotate(flapAngle);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 28);
      ctx.strokeStyle = isDark ? "#86EFAC" : "#166534"; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fillStyle = isDark ? "#86EFAC" : "#166534"; ctx.fill();
      ctx.restore();
      ctx.font = "8px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.35)" : "rgba(22,101,52,0.25)";
      ctx.textAlign = "center"; ctx.fillText("SERVO", sorterX, cY - 12);

      // Sort bins
      const binW = 25;
      [{ x: binHeavyX, l: "HEAVY", c: "#FCA5A5" }, { x: binLightX, l: "LIGHT", c: "#93C5FD" }].forEach(({ x, l, c }) => {
        ctx.beginPath(); ctx.moveTo(x - binW, binY - 5); ctx.lineTo(x + binW, binY - 5);
        ctx.lineTo(x + binW * 0.6, binY + 25); ctx.lineTo(x - binW * 0.6, binY + 25); ctx.closePath();
        ctx.fillStyle = c + (isDark ? "15" : "0a"); ctx.fill();
        ctx.strokeStyle = c; ctx.globalAlpha = 0.4; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
        ctx.font = "8px monospace"; ctx.fillStyle = c; ctx.globalAlpha = 0.5;
        ctx.textAlign = "center"; ctx.fillText(l, x, binY + 36); ctx.globalAlpha = 1;
      });

      // === CURRENT GRAPH (right side) ===
      ctx.strokeStyle = isDark ? "rgba(134,239,172,0.15)" : "rgba(22,101,52,0.08)";
      ctx.lineWidth = 1; ctx.strokeRect(graphL, graphT, graphR - graphL, graphB - graphT);

      // Graph title
      ctx.font = "10px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.5)" : "rgba(22,101,52,0.4)";
      ctx.textAlign = "center"; ctx.fillText("MOTOR CURRENT (A)", (graphL + graphR) / 2, graphT - 6);

      // Threshold line
      const thresholdY = graphT + (graphB - graphT) * 0.35;
      ctx.beginPath(); ctx.moveTo(graphL, thresholdY); ctx.lineTo(graphR, thresholdY);
      ctx.strokeStyle = "#FCA5A5"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = "7px monospace"; ctx.fillStyle = "#FCA5A5"; ctx.textAlign = "left";
      ctx.fillText("HEAVY", graphR + 3, thresholdY + 3);

      // Y axis labels
      ctx.font = "7px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.3)" : "rgba(22,101,52,0.2)";
      ctx.textAlign = "right";
      ctx.fillText("1.2A", graphL - 3, graphT + 8);
      ctx.fillText("0.5A", graphL - 3, graphB - 2);

      // Current history waveform
      const hist = currentHistoryRef.current;
      ctx.beginPath();
      for (let i = 0; i < hist.length; i++) {
        const gx = graphL + (i / hist.length) * (graphR - graphL);
        const normalized = (hist[i] - 0.3) / 0.9; // map 0.3-1.2A to 0-1
        const gy = graphB - normalized * (graphB - graphT);
        i === 0 ? ctx.moveTo(gx, gy) : ctx.lineTo(gx, gy);
      }
      ctx.strokeStyle = isDark ? "#86EFAC" : "#166534"; ctx.lineWidth = 1.5; ctx.stroke();

      // Current value readout
      const currVal = currentRef.current;
      ctx.font = "16px monospace"; ctx.fillStyle = currVal > 0.8 ? "#FCA5A5" : (isDark ? "#86EFAC" : "#166534");
      ctx.textAlign = "center"; ctx.fillText(currVal.toFixed(2) + "A", (graphL + graphR) / 2, graphB + 20);

      // Detection status
      if (currVal > 0.8) {
        ctx.font = "11px monospace"; ctx.fillStyle = "#FCA5A5";
        ctx.fillText("HEAVY DETECTED!", (graphL + graphR) / 2, graphB + 36);
      } else if (currVal > 0.6) {
        ctx.font = "11px monospace"; ctx.fillStyle = "#93C5FD";
        ctx.fillText("LIGHT DETECTED", (graphL + graphR) / 2, graphB + 36);
      } else {
        ctx.font = "11px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.3)" : "rgba(22,101,52,0.2)";
        ctx.fillText("IDLE", (graphL + graphR) / 2, graphB + 36);
      }

      // Sorted count
      ctx.font = "10px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.5)" : "rgba(22,101,52,0.4)";
      ctx.textAlign = "center";
      ctx.fillText("Heavy: " + sortedRef.current.heavy + "  Light: " + sortedRef.current.light, (graphL + graphR) / 2, h - 10);

      // === PHYSICS ===
      if (state === "running") {
        // Target current: baseline + sum of items on belt near sensor
        let targetCurrent = 0.5;
        itemsRef.current.forEach((item) => {
          if (!item.falling && !item.sorted) {
            const dist = Math.abs(item.x - sensorX);
            if (dist < 40) {
              const influence = 1 - dist / 40;
              targetCurrent += item.heavy ? 0.6 * influence : 0.2 * influence;
            }
          }
        });
        // Smooth current transition
        currentRef.current += (targetCurrent - currentRef.current) * 0.08;
        // Add slight noise
        currentRef.current += (Math.random() - 0.5) * 0.01;

        // Update history
        currentHistoryRef.current.push(currentRef.current);
        if (currentHistoryRef.current.length > 200) currentHistoryRef.current.shift();

        // Update items
        itemsRef.current.forEach((item) => {
          if (item.falling && !item.sorted) {
            item.vy += 0.15;
            item.y += item.vy;
            if (item.y >= cY - 8) {
              item.y = cY - 8;
              item.falling = false;
              item.vy = 0;
            }
          } else if (!item.sorted) {
            // On belt — move right
            item.x += 0.5;

            // Auto-detect at sensor position
            if (item.x >= sensorX - 5 && item.x <= sensorX + 5 && !item.detected) {
              item.detected = true;
            }

            // Auto-sort at sorter position
            if (item.x >= sorterX - 3) {
              item.sorted = true;
              item.falling = true;
              item.vy = 0;
              item.sortDir = item.heavy ? -1 : 1;
              if (item.heavy) sortedRef.current.heavy++;
              else sortedRef.current.light++;
            }
          } else if (item.sorted) {
            // Falling into bin
            item.vy += 0.1;
            item.y += item.vy;
            item.x += item.sortDir * 0.4;
          }
        });

        // Remove off-screen items
        itemsRef.current = itemsRef.current.filter((i) => i.y < h + 20);
      }

      // Draw items
      itemsRef.current.forEach((item) => {
        const color = item.heavy ? "#FCA5A5" : "#93C5FD";
        const size = item.heavy ? 14 : 10;
        ctx.beginPath(); ctx.roundRect(item.x - size / 2, item.y - size, size, size, 2);
        ctx.fillStyle = color; ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
        // Weight indicator
        ctx.font = "7px monospace"; ctx.fillStyle = color; ctx.textAlign = "center";
        ctx.fillText(item.heavy ? "H" : "L", item.x, item.y - size - 2);
        // Detection ring
        if (item.detected && !item.sorted) {
          ctx.beginPath(); ctx.arc(item.x, item.y - size / 2, size, 0, Math.PI * 2);
          ctx.strokeStyle = item.heavy ? "#FCA5A5" : "#93C5FD"; ctx.lineWidth = 1; ctx.globalAlpha = 0.3; ctx.stroke(); ctx.globalAlpha = 1;
        }
      });

      // Idle instructions
      if (state === "idle") {
        ctx.font = "12px monospace"; ctx.fillStyle = isDark ? "rgba(134,239,172,0.3)" : "rgba(22,101,52,0.25)";
        ctx.textAlign = "center";
        ctx.fillText("Click the hopper to drop objects onto the belt", w * 0.35, h * 0.85);
        ctx.fillText("Watch how motor current spikes detect weight automatically", w * 0.35, h * 0.85 + 16);
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animRef.current); canvas.removeEventListener("click", onClick); };
  }, [resolvedTheme]);

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)] aspect-[16/9] cursor-pointer">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" role="img"
          aria-label="GridBox conveyor: click hopper to drop objects, system auto-detects weight via motor current" />
      </div>
      <button onClick={() => { itemsRef.current = []; currentHistoryRef.current = new Array(200).fill(0.5); currentRef.current = 0.5; sortedRef.current = { heavy: 0, light: 0 }; setGameState("running"); }}
        className="w-full py-3 rounded-lg font-semibold text-sm text-[#0c0a09] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors">
        {gameState === "idle" ? "Start Conveyor" : "Reset"}
      </button>
    </div>
  );
}
