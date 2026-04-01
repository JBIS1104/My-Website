"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import type { Project } from "@/types";
import { ProjectGallery } from "@/components/ui/ProjectGallery";
import { ProjectIllustration } from "@/components/ui/ProjectIllustration";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const number = String(index + 1).padStart(2, "0");
  const isReversed = index % 2 === 1;

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const textY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <motion.article
      id={`project-${project.id}`}
      ref={cardRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="group relative"
    >
      <div
        role="button" tabIndex={0}
        className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 py-16 md:py-24 cursor-pointer items-center
                    border-b border-[var(--color-border)] last:border-b-0`}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsExpanded(!isExpanded); } }}
      >
        {/* Text content */}
        <motion.div
          style={{ y: textY }}
          className={`lg:col-span-5 flex flex-col justify-center
                      ${isReversed ? "lg:order-2 lg:pl-16" : "lg:order-1 lg:pr-16"}`}
        >
          {/* Number + Category */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl md:text-6xl font-bold text-[var(--color-border)] group-hover:text-[var(--color-accent)] transition-colors duration-500 font-display">
              {number}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-[var(--color-accent-text)]">
                {project.category}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider">
                {project.subtitle}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-[clamp(1.8rem,3.5vw,3rem)] font-bold leading-[1.05] tracking-tight text-[var(--color-text)] uppercase mb-6
                         group-hover:text-[var(--color-accent-text)] transition-colors duration-500">
            {project.title}
          </h3>

          {/* Expanding line */}
          <div className="w-16 h-0.5 bg-[var(--color-border)] mb-6 group-hover:w-full group-hover:bg-[var(--color-accent)] transition-all duration-700 ease-out" />

          {/* Description */}
          <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
            {project.description}
          </p>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-full
                           border border-[var(--color-border)] text-[var(--color-text-muted)]
                           group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent-text)]
                           transition-colors duration-300"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${project.id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                         bg-[var(--color-accent)] text-[#0c0a09]
                         hover:bg-[var(--color-accent-hover)] transition-colors
                         shadow-lg shadow-[var(--color-accent-glow)]"
            >
              View Project
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <div className="flex items-center gap-3 text-sm font-mono text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-text)] transition-colors">
              <motion.span
                animate={{ rotate: isExpanded ? 45 : 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)]
                           group-hover:border-[var(--color-accent)] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </motion.span>
              <span className="tracking-wider uppercase text-xs">
                {isExpanded ? "Close" : "Gallery"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Illustration with parallax */}
        <motion.div
          style={{ y: imageY }}
          className={`lg:col-span-7 ${isReversed ? "lg:order-1" : "lg:order-2"}`}
        >
          <div className="relative overflow-hidden rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]
                          aspect-[16/10] group-hover:border-[var(--color-accent)] transition-all duration-500
                          group-hover:shadow-2xl group-hover:shadow-[var(--color-accent-glow)]">
            {project.image ? (
              <>
                {/* Project photo: grayscale by default, color on hover */}
                <img
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover
                             grayscale group-hover:grayscale-0
                             transition-all duration-700 ease-out
                             group-hover:scale-105"
                />
                {/* Subtle overlay for readability */}
                <div className="absolute inset-0 bg-[var(--color-bg)]/10 group-hover:bg-transparent transition-all duration-500" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="absolute inset-0 grid-paper opacity-30" />
                <ProjectIllustration
                  projectId={project.id}
                  className="relative z-10 w-full h-full max-h-[300px]"
                />
              </div>
            )}

            {/* Hover sweep effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/0 via-[var(--color-accent)]/5 to-[var(--color-accent)]/0
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
          </div>
        </motion.div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-12">
              {/* Gallery — the main feature of expanded view */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="mb-8" onClick={(e) => e.stopPropagation()}>
                  <ProjectGallery slides={project.gallery} />
                </div>
              )}

              {/* Links */}
              {(project.links.github || project.links.demo) && (
                <div className="flex flex-wrap gap-3 mt-6">
                  {project.links.github && (
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                                 border border-[var(--color-border)] text-[var(--color-text)]
                                 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-text)] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                  )}
                  {project.links.demo && (
                    <a href={project.links.demo} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                                 border border-[var(--color-border)] text-[var(--color-text)]
                                 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-text)] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Watch Demo
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
