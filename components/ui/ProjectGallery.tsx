"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { GallerySlide } from "@/types";

interface ProjectGalleryProps {
  slides: GallerySlide[];
}

export function ProjectGallery({ slides }: ProjectGalleryProps) {
  const [current, setCurrent] = useState(0);

  if (slides.length === 0) return null;

  const slide = slides[current];

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="space-y-4">
      {/* Image viewer */}
      <div className="relative rounded-xl overflow-hidden bg-[var(--color-bg)] border border-[var(--color-border)] aspect-[16/10]">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={slide.image}
            alt={slide.caption}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full object-contain p-2"
          />
        </AnimatePresence>

        {/* Nav arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
                         bg-[var(--color-bg-elevated)]/80 backdrop-blur-sm border border-[var(--color-border)]
                         flex items-center justify-center text-[var(--color-text-muted)]
                         hover:border-[var(--color-accent)] hover:text-[var(--color-accent-text)] transition-colors"
              aria-label="Previous image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
                         bg-[var(--color-bg-elevated)]/80 backdrop-blur-sm border border-[var(--color-border)]
                         flex items-center justify-center text-[var(--color-text-muted)]
                         hover:border-[var(--color-accent)] hover:text-[var(--color-accent-text)] transition-colors"
              aria-label="Next image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Counter */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[var(--color-bg-elevated)]/80 backdrop-blur-sm
                        border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-muted)]">
          {current + 1} / {slides.length}
        </div>
      </div>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.p
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="text-sm text-[var(--color-text-muted)] leading-relaxed"
        >
          {slide.caption}
        </motion.p>
      </AnimatePresence>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-[var(--color-accent)] w-6"
                  : "bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
