"use client";

import { useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";

interface Robot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
}

const ROBOT_COUNT = 7;
const FORMATIONS = [
  // Circle
  (i: number, n: number, cx: number, cy: number, r: number) => ({
    x: cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2),
    y: cy + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2),
  }),
  // V-shape
  (i: number, n: number, cx: number, cy: number, r: number) => {
    const half = Math.floor(n / 2);
    const side = i <= half ? -1 : 1;
    const idx = i <= half ? i : i - half - 1;
    return {
      x: cx + side * idx * (r / 2.5),
      y: cy - r + idx * (r / 2.5),
    };
  },
  // Line
  (i: number, n: number, cx: number, cy: number, r: number) => ({
    x: cx + (i - n / 2) * (r / 2.5),
    y: cy,
  }),
  // Diamond
  (i: number, n: number, cx: number, cy: number, r: number) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const stretch = i % 2 === 0 ? 1.0 : 0.55;
    return {
      x: cx + r * stretch * Math.cos(angle),
      y: cy + r * stretch * Math.sin(angle),
    };
  },
];

export function FormationDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const robotsRef = useRef<Robot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const formationRef = useRef(0);
  const timeRef = useRef(0);
  const animRef = useRef<number>(0);
  const { resolvedTheme } = useTheme();

  const initRobots = useCallback((width: number, height: number) => {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.3;
    const formation = FORMATIONS[formationRef.current];

    robotsRef.current = Array.from({ length: ROBOT_COUNT }, (_, i) => {
      const target = formation(i, ROBOT_COUNT, cx, cy, r);
      return {
        x: cx + (Math.random() - 0.5) * 100,
        y: cy + (Math.random() - 0.5) * 100,
        vx: 0,
        vy: 0,
        targetX: target.x,
        targetY: target.y,
      };
    });
  }, []);

  const updateTargets = useCallback((width: number, height: number) => {
    const cx = mouseRef.current.active ? mouseRef.current.x : width / 2;
    const cy = mouseRef.current.active ? mouseRef.current.y : height / 2;
    const r = Math.min(width, height) * 0.28;
    const formation = FORMATIONS[formationRef.current];

    robotsRef.current.forEach((robot, i) => {
      const target = formation(i, ROBOT_COUNT, cx, cy, r);
      robot.targetX = target.x;
      robot.targetY = target.y;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      if (robotsRef.current.length === 0) {
        initRobots(rect.width, rect.height);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleClick = () => {
      formationRef.current = (formationRef.current + 1) % FORMATIONS.length;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        active: true,
      };
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    const isDark = resolvedTheme === "dark";
    const accentColor = "#86EFAC";
    const dimColor = isDark ? "rgba(134,239,172,0.08)" : "rgba(34,197,94,0.06)";
    const robotColor = isDark ? "#86EFAC" : "#166534";
    const trailColor = isDark ? "rgba(134,239,172,0.15)" : "rgba(34,197,94,0.1)";

    const animate = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);
      timeRef.current += 0.016;

      updateTargets(w, h);

      const robots = robotsRef.current;

      // Draw connection lines between nearby robots
      for (let i = 0; i < robots.length; i++) {
        for (let j = i + 1; j < robots.length; j++) {
          const dx = robots[j].x - robots[i].x;
          const dy = robots[j].y - robots[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.min(w, h) * 0.5;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.4;
            ctx.beginPath();
            ctx.moveTo(robots[i].x, robots[i].y);
            ctx.lineTo(robots[j].x, robots[j].y);
            ctx.strokeStyle = isDark
              ? `rgba(134,239,172,${alpha})`
              : `rgba(34,197,94,${alpha * 0.7})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Update and draw robots
      robots.forEach((robot, i) => {
        // DAF-style control: proportional control toward target
        const dx = robot.targetX - robot.x;
        const dy = robot.targetY - robot.y;
        const kp = 0.04;
        const kd = 0.3;

        robot.vx += dx * kp - robot.vx * kd;
        robot.vy += dy * kp - robot.vy * kd;
        robot.x += robot.vx;
        robot.y += robot.vy;

        // Trail
        ctx.beginPath();
        ctx.arc(robot.x, robot.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = trailColor;
        ctx.fill();

        // Outer ring (pulsing)
        const pulse = 1 + 0.1 * Math.sin(timeRef.current * 3 + i * 0.8);
        ctx.beginPath();
        ctx.arc(robot.x, robot.y, 8 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(robot.x, robot.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = robotColor;
        ctx.fill();

        // Target indicator (faint)
        ctx.beginPath();
        ctx.arc(robot.targetX, robot.targetY, 2, 0, Math.PI * 2);
        ctx.fillStyle = dimColor;
        ctx.fill();
      });

      // Draw formation label
      const labels = ["CIRCLE", "V-FORM", "LINE", "DIAMOND"];
      ctx.font = "10px monospace";
      ctx.fillStyle = isDark ? "rgba(134,239,172,0.3)" : "rgba(22,101,52,0.3)";
      ctx.textAlign = "left";
      ctx.fillText(`FORMATION: ${labels[formationRef.current]}`, 12, h - 12);
      ctx.fillText("CLICK TO CHANGE", 12, h - 26);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [resolvedTheme, initRobots, updateTargets]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-[var(--color-border)]
                    hover:border-[var(--color-accent)] transition-colors duration-500 cursor-crosshair">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" role="img" aria-label="Interactive multi-robot formation control demo: move mouse to guide robots, click to change formation" />
      <div className="absolute top-4 right-4 text-xs font-mono tracking-widest uppercase text-[var(--color-text-muted)] opacity-50">
        Live Formation Control
      </div>
    </div>
  );
}
