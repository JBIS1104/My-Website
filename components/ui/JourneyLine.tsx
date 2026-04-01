"use client";

import { motion, useScroll, useTransform } from "motion/react";

export function JourneyLine() {
  const { scrollYProgress } = useScroll();
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="fixed left-6 md:left-10 top-0 bottom-0 z-10 pointer-events-none hidden lg:block">
      {/* Background track */}
      <div className="absolute inset-0 w-px bg-[var(--color-border)] opacity-20" />
      {/* Animated fill */}
      <motion.div
        className="absolute top-0 left-0 w-px bg-[var(--color-accent)] origin-top"
        style={{ height }}
      />
      {/* Glowing dot at current position */}
      <motion.div
        className="absolute left-[-3px] w-[7px] h-[7px] rounded-full bg-[var(--color-accent)]"
        style={{ top: height }}
      >
        <div className="absolute inset-0 rounded-full bg-[var(--color-accent)] animate-ping opacity-30" />
      </motion.div>
    </div>
  );
}
