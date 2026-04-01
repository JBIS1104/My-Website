"use client";

import { motion } from "motion/react";

interface SkillBadgeProps {
  name: string;
  proficiency: "learning" | "intermediate" | "advanced" | "expert";
}

const proficiencyColors = {
  learning: "border-yellow-500/30 hover:border-yellow-500",
  intermediate: "border-blue-500/30 hover:border-blue-500",
  advanced: "border-emerald-500/30 hover:border-emerald-500",
  expert: "border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]",
};

const proficiencyDots = {
  learning: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export function SkillBadge({ name, proficiency }: SkillBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`group relative px-4 py-2.5 rounded-lg border bg-[var(--color-bg-elevated)]
                  transition-all duration-300 cursor-default overflow-hidden ${proficiencyColors[proficiency]}`}
    >
      <motion.div
        className="absolute inset-0 bg-[var(--color-accent)] origin-left rounded-lg"
        style={{ opacity: 0.08 }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: proficiencyDots[proficiency] / 4 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" as const }}
      />
      <div className="relative flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--color-text)]">
          {name}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                i < proficiencyDots[proficiency]
                  ? "bg-[var(--color-accent)]"
                  : "bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
