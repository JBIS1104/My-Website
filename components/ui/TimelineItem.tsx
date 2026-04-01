"use client";

import { motion } from "motion/react";
import type { ExperienceEntry } from "@/types";

interface TimelineItemProps {
  entry: ExperienceEntry;
  index: number;
}

export function TimelineItem({ entry, index }: TimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative pl-8 md:pl-12 pb-12 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--color-border)]" />

      {/* Timeline dot */}
      <div className="absolute left-[-5px] top-1 w-[11px] h-[11px] rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-bg)]" />

      {/* Content */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6
                      hover:border-[var(--color-accent)] transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mb-3">
          <h3 className="text-lg font-bold text-[var(--color-text)]">
            {entry.title}
          </h3>
          <span className="text-xs font-mono text-[var(--color-accent)] tracking-wider">
            {entry.period}
          </span>
        </div>
        <p className="text-sm font-medium text-[var(--color-accent)] mb-3">
          {entry.organization}
        </p>
        <p className="text-[var(--color-text-muted)] mb-4 leading-relaxed">
          {entry.description}
        </p>
        <ul className="space-y-1.5">
          {entry.highlights.map((highlight, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]"
            >
              <span className="text-[var(--color-accent)] mt-0.5 flex-shrink-0">
                &bull;
              </span>
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
