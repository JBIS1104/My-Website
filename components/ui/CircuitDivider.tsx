"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

const WAVEFORMS = {
  sine: "M0,40 C50,40 50,10 100,10 C150,10 150,70 200,70 C250,70 250,10 300,10 C350,10 350,70 400,70 C450,70 450,10 500,10 C550,10 550,70 600,70 C650,70 650,10 700,10 C750,10 750,40 800,40",
  step: "M0,60 H100 V20 H250 V60 H400 V20 H550 V60 H700 V20 H800",
  damped: "M0,40 C30,40 30,10 60,10 C90,10 90,55 120,55 C150,55 150,18 180,18 C210,18 210,50 240,50 C270,50 270,25 300,25 C330,25 330,48 360,48 C390,48 390,30 420,30 C450,30 450,44 480,44 C510,44 510,35 540,35 C570,35 570,42 600,42 C650,42 700,40 800,40",
  noise: "M0,40 L20,35 L40,48 L60,28 L80,55 L100,22 L120,50 L140,30 L160,45 L180,25 L200,52 L220,32 L240,42 L260,38 L280,44 L300,36 L320,41 L340,39 L360,40 L400,42 L420,38 L440,45 L460,33 L480,48 L500,28 L520,55 L540,20 L560,50 L580,30 L600,45 L620,35 L640,42 L660,38 L680,40 L700,39 L740,40 L780,40 L800,40",
};

type WaveformType = keyof typeof WAVEFORMS;

interface CircuitDividerProps {
  variant?: WaveformType;
}

export function CircuitDivider({ variant = "sine" }: CircuitDividerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <div ref={ref} className="py-4 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 800 80" className="w-full max-w-5xl h-16" fill="none" preserveAspectRatio="none">
        <motion.path
          d={WAVEFORMS[variant]}
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 0.35 } : {}}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        <motion.circle cx="0" cy="40" r="3" fill="var(--color-accent)"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.3 } : {}} transition={{ delay: 0.2 }} />
        <motion.circle cx="800" cy="40" r="3" fill="var(--color-accent)"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.3 } : {}} transition={{ delay: 1.4 }} />
      </svg>
    </div>
  );
}
