"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { TextReveal } from "@/components/animations/TextReveal";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TypingRotation } from "@/components/ui/TypingRotation";
import { FaceTrackingDemo } from "@/components/ui/FaceTrackingDemo";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="absolute inset-0 grid-paper opacity-50 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "var(--color-accent)" }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "var(--color-accent-secondary)" }}
        />
      </div>

      <motion.div
        style={{ y: textY, opacity, scale }}
        className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 py-32 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <FadeInOnScroll delay={0.2}>
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-[var(--color-accent)]"
                />
                <span className="text-sm font-mono text-[var(--color-accent-text)] tracking-wider uppercase">
                  Predicted First Class BEng
                </span>
              </div>
            </FadeInOnScroll>

            <h1 data-egg="name" className="text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[0.95] tracking-tighter text-[var(--color-text)]">
              <TextReveal text="Junbyung" delay={0.3} />
              <br />
              <span className="inline-flex items-baseline gap-4">
                <TextReveal text="Park" delay={0.6} />
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                  className="hidden md:inline-block h-1.5 w-24 bg-[var(--color-accent)] rounded-full origin-left"
                />
              </span>
            </h1>

            <FadeInOnScroll delay={0.9}>
              <p className="mt-8 text-xl md:text-2xl font-display font-medium text-[var(--color-text-muted)]">
                Mechatronics Engineer
                <span className="text-[var(--color-accent)]"> / </span>
                <TypingRotation words={["Robotics Researcher", "Control Systems", "F-35 Veteran", "PhD Candidate"]} />
              </p>
            </FadeInOnScroll>

            <FadeInOnScroll delay={1.1}>
              <p className="mt-6 text-lg text-[var(--color-text-muted)] leading-relaxed">
                I don&apos;t just build — I continuously improve every system I touch.
                From maintaining F-35 fighter jet facilities in the Korean Air Force
                to researching multi-robot collision avoidance at the University of Manchester.
                Currently preparing for PhD research in decentralised robotics.
              </p>
            </FadeInOnScroll>

            <FadeInOnScroll delay={1.3}>
              <div className="mt-10 flex flex-wrap gap-4">
                <MagneticButton
                  as="a"
                  href="#projects"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[#0c0a09]
                             bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
                             transition-colors duration-300 shadow-lg shadow-[var(--color-accent-glow)]"
                >
                  View Projects
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href="#quiz"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold
                             text-[var(--color-text)] border border-[var(--color-border)]
                             hover:border-[var(--color-accent)] hover:text-[var(--color-accent-text)]
                             transition-colors duration-300"
                >
                  Take the Quiz
                </MagneticButton>
              </div>
            </FadeInOnScroll>
          </div>

          <div className="lg:col-span-6">
            <FadeInOnScroll delay={1.0} direction="left">
              <FaceTrackingDemo />
            </FadeInOnScroll>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            data-egg="scroll-indicator"
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-[var(--color-text-muted)] font-mono tracking-widest uppercase">
              Scroll
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
