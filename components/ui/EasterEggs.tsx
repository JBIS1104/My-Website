"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface EasterEggMessage {
  id: number;
  text: string;
  emoji: string;
}

// Easter eggs triggered by clicking specific elements on the page
const CLICK_TRIGGERS: { selector: string; text: string; clicks: number; emoji: string; effect?: string }[] = [
  { selector: "[data-egg='logo']", clicks: 3, emoji: "🔓", text: "You found the secret! Try clicking other things around the page..." },
  { selector: "[data-egg='name']", clicks: 1, emoji: "🇰🇷", text: "안녕하세요! That's 'hello' in Korean — I'm Junbyung but friends call me Billy!" },
  { selector: "[data-egg='stat-17']", clicks: 1, emoji: "✈️", text: "17% reliability improvement on F-35 facilities — zero-downtime environment, no room for mistakes" },
  { selector: "[data-egg='stat-1st']", clicks: 1, emoji: "🎓", text: "Working toward a PhD in Multi-Robot Systems after graduation — robots that think together!" },
  { selector: "[data-egg='scroll-indicator']", clicks: 1, emoji: "🤫", text: "You're clicking the scroll indicator instead of scrolling... I admire the curiosity though!" },
  { selector: "[data-egg='theme-toggle']", clicks: 1, emoji: "🌈", text: "Fun fact: I designed the dark mode first!", effect: "rainbow" },
  { selector: "[data-egg='footer']", clicks: 1, emoji: "🔧", text: "P: Please  I: I'm  D: Debugging — every embedded engineer's daily mantra" },
];

export function EasterEggs() {
  const [messages, setMessages] = useState<EasterEggMessage[]>([]);
  const clickCountsRef = useRef<Record<string, { count: number; timer: ReturnType<typeof setTimeout> | null }>>({});
  const triggeredRef = useRef<Set<string>>(new Set());
  const idRef = useRef(0);

  const showMessage = (text: string, emoji: string, effect?: string) => {
    const id = ++idRef.current;
    setMessages((prev) => [...prev, { id, text, emoji }]);
    setTimeout(() => setMessages((prev) => prev.filter((m) => m.id !== id)), 5000);

    if (effect === "rainbow") {
      document.body.style.transition = "filter 1s";
      document.body.style.filter = "hue-rotate(90deg) saturate(1.5)";
      setTimeout(() => { document.body.style.filter = ""; }, 3000);
    }
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      for (const trigger of CLICK_TRIGGERS) {
        const el = target.closest(trigger.selector);
        if (!el) continue;
        if (triggeredRef.current.has(trigger.selector)) continue; // only trigger once per session

        const key = trigger.selector;
        if (!clickCountsRef.current[key]) {
          clickCountsRef.current[key] = { count: 0, timer: null };
        }
        const state = clickCountsRef.current[key];
        state.count++;

        // Reset count after 3 seconds of no clicks
        if (state.timer) clearTimeout(state.timer);
        state.timer = setTimeout(() => { state.count = 0; }, 3000);

        if (state.count >= trigger.clicks) {
          showMessage(trigger.text, trigger.emoji, trigger.effect);
          triggeredRef.current.add(trigger.selector);
          state.count = 0;
        }
        break;
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] pointer-events-none flex flex-col items-center gap-2">
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="px-5 py-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-accent)]
                       shadow-xl shadow-[var(--color-accent-glow)] backdrop-blur-sm pointer-events-auto max-w-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{msg.emoji}</span>
              <p className="text-sm font-mono text-[var(--color-text)]">{msg.text}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
