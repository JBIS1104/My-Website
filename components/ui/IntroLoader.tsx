"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function IntroLoader() {
  const [phase, setPhase] = useState<"loading" | "revealing" | "done">("loading");

  useEffect(() => {
    // Lock scroll during loading
    document.body.style.overflow = "hidden";
    const t1 = setTimeout(() => setPhase("revealing"), 1400);
    const t2 = setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
    }, 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--color-bg)]"
        >
          <div className="text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-5xl font-display font-bold text-[var(--color-text)] mb-6"
            >
              JP<span className="text-[var(--color-accent)]">.</span>
            </motion.div>

            {/* Terminal-style loading text */}
            <div className="font-mono text-xs text-[var(--color-text-muted)] space-y-1">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-[var(--color-accent)]">&gt;</span> initializing portfolio...
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <span className="text-[var(--color-accent)]">&gt;</span> loading projects [6/6]
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <span className="text-[var(--color-accent)]">&gt;</span> calibrating formation control...
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <span className="text-[var(--color-accent)]">&gt;</span> ready.
              </motion.p>
            </div>

            {/* Loading bar */}
            <div className="mt-6 w-48 h-0.5 bg-[var(--color-border)] rounded-full overflow-hidden mx-auto">
              <motion.div
                className="h-full bg-[var(--color-accent)] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.3, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
