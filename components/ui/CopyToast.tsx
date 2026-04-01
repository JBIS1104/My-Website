"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CopyToastProps {
  text: string;
  visible: boolean;
  onDone: () => void;
}

export function CopyToast({ text, visible, onDone }: CopyToastProps) {
  const [displayLength, setDisplayLength] = useState(0);

  useEffect(() => {
    if (!visible) {
      setDisplayLength(0);
      return;
    }
    const interval = setInterval(() => {
      setDisplayLength((prev) => {
        if (prev >= text.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 35);

    const timeout = setTimeout(onDone, 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [visible, text, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]
                     px-5 py-3 rounded-lg border border-[var(--color-accent)]
                     bg-[var(--color-bg-elevated)] shadow-xl shadow-[var(--color-accent-glow)]
                     grid-paper"
        >
          <div className="flex items-center gap-3">
            <motion.svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <motion.polyline
                points="20 6 9 17 4 12"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              />
            </motion.svg>
            <span className="font-mono text-sm text-[var(--color-text)]">
              {text.slice(0, displayLength)}
              <span className="animate-pulse text-[var(--color-accent)]">|</span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
