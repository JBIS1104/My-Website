"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function StatsSection() {
  return (
    <section className="py-16 md:py-20 border-y border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <FadeInOnScroll>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <AnimatedCounter end={17} suffix="%" data-egg="stat-17" prefix="+" label="Reliability Improvement" />
            <AnimatedCounter end={6} label="Engineering Projects" />
            <AnimatedCounter end={1} suffix="st" data-egg="stat-1st" label="Class Predicted" />
            <AnimatedCounter end={3} suffix="rd" label="UoM Hackathon 2025" />
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
