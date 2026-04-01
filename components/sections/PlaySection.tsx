"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";

type GameState = "idle" | "waiting" | "ready" | "done" | "too-early";

export function PlaySection() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const startTimeRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const startGame = useCallback(() => {
    setGameState("waiting");
    const delay = 1500 + Math.random() * 3500;
    timeoutRef.current = setTimeout(() => {
      setGameState("ready");
      startTimeRef.current = performance.now();
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState("too-early");
      return;
    }

    if (gameState === "ready") {
      const time = Math.round(performance.now() - startTimeRef.current);
      setReactionTime(time);
      setAttempts((prev) => [...prev, time]);
      if (bestTime === null || time < bestTime) setBestTime(time);
      setGameState("done");
      return;
    }

    if (gameState === "idle" || gameState === "done" || gameState === "too-early") {
      startGame();
    }
  }, [gameState, bestTime, startGame]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getMessage = () => {
    if (reactionTime < 200) return "Superhuman! Are you a robot? 🤖";
    if (reactionTime < 250) return "Lightning fast! Fighter pilot reflexes ⚡";
    if (reactionTime < 300) return "Great reflexes! Faster than most humans 🏎️";
    if (reactionTime < 400) return "Solid reaction time! 👍";
    return "Keep practicing! Try again 💪";
  };

  const bgColor = {
    idle: "bg-[var(--color-bg-elevated)]",
    waiting: "bg-red-500/10",
    ready: "bg-[var(--color-accent)]/20",
    done: "bg-[var(--color-bg-elevated)]",
    "too-early": "bg-red-500/10",
  };

  const borderColor = {
    idle: "border-[var(--color-border)]",
    waiting: "border-red-400",
    ready: "border-[var(--color-accent)]",
    done: "border-[var(--color-accent)]",
    "too-early": "border-red-400",
  };

  return (
    <SectionWrapper id="play">
      <FadeInOnScroll>
        <SectionHeading subtitle="How fast are your reflexes? Test your reaction time.">
          Play
        </SectionHeading>
      </FadeInOnScroll>

      <div className="max-w-2xl mx-auto">
        <FadeInOnScroll delay={0.2}>
          <motion.div
            role="button" tabIndex={0} onClick={handleClick} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }}
            className={`relative rounded-2xl border-2 ${borderColor[gameState]} ${bgColor[gameState]}
                       transition-colors duration-300 cursor-pointer select-none overflow-hidden
                       min-h-[300px] flex flex-col items-center justify-center p-8`}
            whileTap={{ scale: 0.98 }}
          >
            {gameState === "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-5xl mb-4">🎯</p>
                <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">
                  Reaction Speed Test
                </h3>
                <p className="text-[var(--color-text-muted)] mb-6">
                  When the box turns <span className="text-[var(--color-accent-text)] font-bold">green</span>, click as fast as you can!
                </p>
                <p className="text-sm font-mono text-[var(--color-accent-text)]">
                  Click to start
                </p>
              </motion.div>
            )}

            {gameState === "waiting" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <motion.p
                  className="text-5xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🔴
                </motion.p>
                <h3 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
                  Wait for green...
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Don&apos;t click yet!
                </p>
              </motion.div>
            )}

            {gameState === "ready" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="text-center"
              >
                <p className="text-5xl mb-4">🟢</p>
                <h3 className="text-3xl font-bold text-[var(--color-accent-text)]">
                  CLICK NOW!
                </h3>
              </motion.div>
            )}

            {gameState === "too-early" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-5xl mb-4">😬</p>
                <h3 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
                  Too early!
                </h3>
                <p className="text-[var(--color-text-muted)] mb-4">
                  Wait for the green signal before clicking.
                </p>
                <p className="text-sm font-mono text-[var(--color-accent-text)]">
                  Click to try again
                </p>
              </motion.div>
            )}

            {gameState === "done" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <motion.p
                  className="text-5xl font-bold text-[var(--color-accent)] mb-2"
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {reactionTime}ms
                </motion.p>
                <p className="text-lg text-[var(--color-text)] font-medium mb-1">
                  {getMessage()}
                </p>
                {bestTime !== null && (
                  <p className="text-sm font-mono text-[var(--color-text-muted)] mb-4">
                    Best: {bestTime}ms
                    {attempts.length > 1 && ` | Avg: ${Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)}ms`}
                    {` | Attempts: ${attempts.length}`}
                  </p>
                )}
                <p className="text-sm font-mono text-[var(--color-accent-text)]">
                  Click to try again
                </p>
              </motion.div>
            )}
          </motion.div>
        </FadeInOnScroll>

        {/* Fun fact */}
        <FadeInOnScroll delay={0.4}>
          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            Average human reaction time is ~250ms. Fighter pilots average ~200ms.
            <br />
            How do you compare to the engineers at the 17th Fighter Wing?
          </p>
        </FadeInOnScroll>
      </div>
    </SectionWrapper>
  );
}
