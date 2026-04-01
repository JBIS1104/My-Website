"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";

interface Student {
  id: number;
  handUp: boolean;
  flagged: boolean;
  emoji: string;
}

const HAND_UP_EMOJIS = ["🙋", "🙋‍♂️", "✋", "🖐️"];
const SITTING_EMOJIS = ["🧑‍💻", "📖", "📝", "🤔", "😶", "🧐", "💭", "👀"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateStudents(): Student[] {
  const handUpCount = 3 + Math.floor(Math.random() * 3); // 3-5 hands up
  const students: Student[] = [];

  for (let i = 0; i < handUpCount; i++) {
    students.push({
      id: i, handUp: true, flagged: false,
      emoji: HAND_UP_EMOJIS[i % HAND_UP_EMOJIS.length],
    });
  }
  for (let i = handUpCount; i < 12; i++) {
    students.push({
      id: i, handUp: false, flagged: false,
      emoji: SITTING_EMOJIS[(i - handUpCount) % SITTING_EMOJIS.length],
    });
  }
  return shuffle(students).map((s, i) => ({ ...s, id: i }));
}

export function SpotDistractedGame() {
  const [students, setStudents] = useState<Student[]>(generateStudents);
  const [phase, setPhase] = useState<"playing" | "revealed">("playing");
  const [timeLeft, setTimeLeft] = useState(12);

  useEffect(() => {
    if (phase !== "playing" || timeLeft <= 0) {
      if (timeLeft <= 0 && phase === "playing") setPhase("revealed");
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const toggleFlag = useCallback(
    (id: number) => {
      if (phase !== "playing") return;
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, flagged: !s.flagged } : s))
      );
    },
    [phase]
  );

  const scan = () => setPhase("revealed");

  const reset = () => {
    setStudents(generateStudents());
    setPhase("playing");
    setTimeLeft(12);
  };

  const truePositives = students.filter((s) => s.flagged && s.handUp).length;
  const falsePositives = students.filter((s) => s.flagged && !s.handUp).length;
  const totalFlagged = students.filter((s) => s.flagged).length;
  const totalHandsUp = students.filter((s) => s.handUp).length;
  const precision = totalFlagged > 0 ? Math.round((truePositives / totalFlagged) * 100) : 0;
  const recall = totalHandsUp > 0 ? Math.round((truePositives / totalHandsUp) * 100) : 0;

  const getCardStyle = (s: Student) => {
    if (phase === "playing") {
      return s.flagged
        ? "border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/10"
        : "border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-accent)]";
    }
    if (s.flagged && s.handUp) return "border-2 border-green-500 bg-green-500/10";
    if (s.flagged && !s.handUp) return "border-2 border-red-700 dark:border-red-400 bg-red-500/10";
    if (!s.flagged && s.handUp) return "border-2 border-amber-600 bg-amber-600/10";
    return "border border-[var(--color-border)] bg-[var(--color-bg-elevated)] opacity-50";
  };

  return (
    <div className="space-y-4">
      {/* Timer bar */}
      <div className="h-1 rounded-full bg-[var(--color-border)] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${timeLeft <= 3 ? "bg-red-700 dark:bg-red-400" : "bg-[var(--color-accent)]"}`}
          animate={{ width: `${(timeLeft / 12) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* HUD */}
      <div className="flex justify-between text-xs font-mono text-[var(--color-text-muted)]">
        <span>DETECTED: {totalFlagged}/12</span>
        <span>{phase === "playing" ? `${timeLeft}s` : "SCANNED"}</span>
      </div>

      {/* Student grid */}
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {students.map((s) => (
          <motion.button
            key={s.id}
            onClick={() => toggleFlag(s.id)}
            disabled={phase === "revealed"}
            whileHover={phase === "playing" ? { scale: 1.05 } : {}}
            whileTap={phase === "playing" ? { scale: 0.95 } : {}}
            animate={
              phase === "revealed" && s.flagged && !s.handUp
                ? { x: [-3, 3, -3, 3, 0] }
                : {}
            }
            transition={{ duration: 0.3 }}
            className={`rounded-xl p-3 transition-all duration-200 cursor-pointer text-center ${getCardStyle(s)}`}
          >
            <span className="text-2xl block">{s.emoji}</span>
            <span className="text-xs font-mono text-[var(--color-text-muted)] mt-1 block">
              {String(s.id + 1).padStart(2, "0")}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Scores */}
      {phase === "revealed" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-8 py-4"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--color-accent)]">{precision}%</p>
            <p className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider">PRECISION</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--color-accent)]">{recall}%</p>
            <p className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider">RECALL</p>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {phase === "playing" ? (
          <button onClick={scan}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-[#0c0a09] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors">
            Scan Classroom
          </button>
        ) : (
          <button onClick={reset}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-[#0c0a09] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors">
            New Class
          </button>
        )}
      </div>

      {phase === "revealed" && (
        <p className="text-xs text-center text-[var(--color-text-muted)]">
          In real CV systems, you tune the trade-off between precision (no false detections) and recall (catch every raised hand).
        </p>
      )}
    </div>
  );
}
