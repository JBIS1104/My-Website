"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "motion/react";

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  label: string;
  "data-egg"?: string;
}

export function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
  duration = 2000,
  label,
  "data-egg": dataEgg,
}: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <div ref={ref} className="text-center" data-egg={dataEgg}>
      <p className="text-4xl md:text-5xl font-bold text-[var(--color-accent)] font-display">
        {prefix}{count}{suffix}
      </p>
      <p className="text-sm text-[var(--color-text-muted)] font-mono mt-2 tracking-wider uppercase">
        {label}
      </p>
    </div>
  );
}
