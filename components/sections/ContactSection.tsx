"use client";

import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { CopyToast } from "@/components/ui/CopyToast";
import { useState, useCallback } from "react";

const EMAIL = "junbyung.park@student.manchester.ac.uk";

const contactLinks = [
  {
    label: "GitHub",
    href: "https://github.com/JBIS1104",
    description: "Check out my code",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/junbyung-park",
    description: "Let's connect professionally",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:junbyung.park@student.manchester.ac.uk",
    description: "Drop me a message",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

export function ContactSection() {
  const [toastVisible, setToastVisible] = useState(false);

  const copyEmail = useCallback(() => {
    navigator.clipboard.writeText(EMAIL);
    setToastVisible(true);
  }, []);

  return (
    <SectionWrapper id="contact">
      <CopyToast text={`${EMAIL} copied.`} visible={toastVisible} onDone={() => setToastVisible(false)} />
      <FadeInOnScroll>
        <SectionHeading subtitle="I'm always open to new opportunities and conversations.">
          Let&apos;s Connect
        </SectionHeading>
      </FadeInOnScroll>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactLinks.map((link, i) => (
          <FadeInOnScroll key={link.label} delay={i * 0.15}>
            <MagneticButton
              as="a"
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              onClick={link.href.startsWith("mailto") ? copyEmail : undefined}
              className="group flex flex-col items-center text-center p-8 rounded-2xl w-full
                         border border-[var(--color-border)] bg-[var(--color-bg-elevated)]
                         hover:border-[var(--color-accent)] hover:shadow-xl
                         hover:shadow-[var(--color-accent-glow)]
                         transition-all duration-300"
            >
              <div className="mb-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-text)] transition-colors">
                {link.icon}
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent-text)] transition-colors">
                {link.label}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {link.description}
              </p>
            </MagneticButton>
          </FadeInOnScroll>
        ))}
      </div>
    </SectionWrapper>
  );
}
