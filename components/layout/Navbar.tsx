"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useScrollSpy } from "@/hooks/useScrollSpy";

const navItems = [
  { label: "About", href: "about" },
  { label: "Labs", href: "games" },
  { label: "Projects", href: "projects" },
  { label: "Experience", href: "experience" },
  { label: "Quiz", href: "quiz" },
  { label: "Contact", href: "contact" },
];

const sectionIds = ["about", "games", "projects", "experience", "quiz", "contact"];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollRef = useRef(0);
  const activeSection = useScrollSpy(sectionIds);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const handleScroll = useCallback(() => {
    const currentScroll = window.scrollY;
    setScrolled(currentScroll > 50);
    setHidden(currentScroll > 300 && currentScroll > lastScrollRef.current);
    lastScrollRef.current = currentScroll;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    if (isHome) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border)]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex h-16 items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              data-egg="logo"
              className="font-display text-xl font-bold tracking-tight text-[var(--color-text)]
                         hover:text-[var(--color-accent-text)] transition-colors"
            >
              JP<span className="text-[var(--color-accent)]">.</span>
            </motion.button>

            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <motion.button
                  key={item.href}
                  whileHover={{ y: -1 }}
                  onClick={() => scrollTo(item.href)}
                  className={`relative text-sm font-medium transition-colors duration-300
                    ${
                      activeSection === item.href
                        ? "text-[var(--color-accent-text)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                >
                  {item.label}
                  {activeSection === item.href && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--color-accent)] rounded-full"
                    />
                  )}
                </motion.button>
              ))}
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-3 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col gap-1.5 p-2"
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="block h-0.5 w-6 bg-[var(--color-text)]"
                />
                <motion.span
                  animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="block h-0.5 w-6 bg-[var(--color-text)]"
                />
                <motion.span
                  animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="block h-0.5 w-6 bg-[var(--color-text)]"
                />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[var(--color-bg)]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => scrollTo(item.href)}
                  className="text-2xl font-display font-bold text-[var(--color-text)]
                             hover:text-[var(--color-accent-text)] transition-colors"
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
