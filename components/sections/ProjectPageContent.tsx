"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { Project } from "@/types";
import { ProjectGallery } from "@/components/ui/ProjectGallery";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";

const CADViewer = dynamic(
  () => import("@/components/ui/CADViewer").then((m) => m.CADViewer),
  { ssr: false }
);

const cadModels: Record<string, {
  objPath: string;
  mtlPath: string;
  materialOverrides?: Record<string, { color: string; metalness?: number; roughness?: number; emissive?: string; emissiveIntensity?: number }>;
  zoom?: number;
  rotateY?: number;
  label: string;
}> = {
  "monitor-arm": {
    objPath: "/models/MonitorArmOBJ.obj",
    mtlPath: "/models/MonitorArmOBJ.mtl",
    materialOverrides: {
      "Body2:1": { color: "#050505", metalness: 0.95, roughness: 0.05 },
      "Body4": { color: "#050505", metalness: 0.95, roughness: 0.05 },
      "Body5": { color: "#050505", metalness: 0.95, roughness: 0.05 },
    },
    zoom: 1,
    rotateY: 180,
    label: "RPR Monitor Arm — Fusion 360 CAD",
  },
  "gridbox": {
    objPath: "/models/Conveyor OBJ.obj",
    mtlPath: "/models/Conveyor OBJ.mtl",
    zoom: 1,
    rotateY: 30,
    label: "GridBox Conveyor System — Fusion 360 CAD",
  },
  "rfl-robot": {
    objPath: "/models/Spaceship OBG.obj",
    mtlPath: "/models/Spaceship OBG.mtl",
    zoom: 1.1,
    rotateY: -30,
    label: "Space Ship Combat Robot — Fusion 360 CAD",
  },
};

const labComponents: Record<string, { component: React.ComponentType; title: string; description: string }> = {
  "monitor-arm": {
    component: dynamic(() => import("@/components/games/MonitorArmGame").then((m) => m.MonitorArmGame), { ssr: false }),
    title: "3D Monitor Arm — Aim at the head!",
    description: "Control the RPR arm in 3D: first R is Yaw (horizontal pan), P is Height (vertical extension), last R is Pitch (monitor tilt). Match the real servo control from the Raspberry Pi 5 project!",
  },
  "multi-robot-control": {
    component: dynamic(() => import("@/components/games/ConsensusSimGame").then((m) => m.ConsensusSimGame), { ssr: false }),
    title: "DAF Navigation — Collision Avoidance in Action!",
    description: "Watch 4 robots navigate around a central obstacle using the exact DAF control law from the research. Smoothstep gamma function, velocity-dependent braking, inter-robot and obstacle avoidance.",
  },
  "line-following-buggy": {
    component: dynamic(() => import("@/components/games/PIDTunerGame").then((m) => m.PIDTunerGame), { ssr: false }),
    title: "PID Tuner — Make the buggy follow the line!",
    description: "Adjust Kp (proportional), Ki (integral), and Kd (derivative) gains. High Kp = aggressive turns but oscillation. Kd = damping. Ki = steady-state correction. Complete 2 laps to get your score.",
  },
  "gridbox": {
    component: dynamic(() => import("@/components/games/ConveyorGame").then((m) => m.ConveyorGame), { ssr: false }),
    title: "Factory Sorter — GridBox Conveyor!",
    description: "Click the hopper to drop objects onto the conveyor. The system auto-detects weight by measuring the DC motor current — heavier objects increase the load, causing a measurable current spike. Watch the real-time current graph: when it crosses the threshold, the servo sorts it into the correct bin.",
  },
  "ai-camera": {
    component: dynamic(() => import("@/components/games/SpotDistractedGame").then((m) => m.SpotDistractedGame), { ssr: false }),
    title: "Hand Detection — Classroom AI!",
    description: "In 12 seconds, click all students with raised hands. After scanning, see your Precision (no false detections) and Recall (found all hands) — the same metrics the hackathon AI camera used.",
  },
  "rfl-robot": {
    component: dynamic(() => import("@/components/games/WedgeArenaGame").then((m) => m.WedgeArenaGame), { ssr: false }),
    title: "Space Ship Arena — Combat Robotics!",
    description: "Drive your wedge robot with WASD or arrow keys. Push the blade bot into one of the two pits — but avoid its spinning blade! Wedge under the opponent for 1.8x push force. First to 3 wins the match.",
  },
};

interface ProjectPageContentProps {
  project: Project;
  prev: Project | null;
  next: Project | null;
}

export function ProjectPageContent({ project, prev, next }: ProjectPageContentProps) {
  const lab = labComponents[project.id];

  return (
    <article className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Back link */}
        <FadeInOnScroll>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm font-mono text-[var(--color-text-muted)]
                       hover:text-[var(--color-accent-text)] transition-colors mb-12 group"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              className="group-hover:-translate-x-1 transition-transform"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="tracking-wider uppercase">All Projects</span>
          </Link>
        </FadeInOnScroll>

        {/* Hero */}
        <div className="mb-16 md:mb-24">
          <FadeInOnScroll>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-[var(--color-accent-text)]">
                {project.category}
              </span>
              <span className="w-8 h-px bg-[var(--color-border)]" />
              <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider">
                {project.subtitle}
              </span>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.1}>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-tight text-[var(--color-text)] uppercase font-display mb-8">
              {project.title}
            </h1>
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.2}>
            <div className="w-24 h-0.5 bg-[var(--color-accent)] rounded-full mb-8" />
          </FadeInOnScroll>

          {/* Tech stack */}
          <FadeInOnScroll delay={0.3}>
            <div className="flex flex-wrap gap-2 mb-10">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-full
                             border border-[var(--color-accent)] text-[var(--color-accent-text)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </FadeInOnScroll>

          {/* Links */}
          {(project.links.github || project.links.demo || project.links.paper) && (
            <FadeInOnScroll delay={0.4}>
              <div className="flex flex-wrap gap-3">
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                               border border-[var(--color-border)] text-[var(--color-text)]
                               hover:border-[var(--color-accent)] hover:text-[var(--color-accent-text)] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                )}
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                               border border-[var(--color-border)] text-[var(--color-text)]
                               hover:border-[var(--color-accent)] hover:text-[var(--color-accent-text)] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Watch Demo
                  </a>
                )}
                {project.links.paper && (
                  <a
                    href={project.links.paper}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                               border border-[var(--color-border)] text-[var(--color-text)]
                               hover:border-[var(--color-accent)] hover:text-[var(--color-accent-text)] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Paper
                  </a>
                )}
              </div>
            </FadeInOnScroll>
          )}
        </div>

        {/* Hero image */}
        {project.image && (
          <FadeInOnScroll>
            <ImageLightbox src={project.image} alt={project.title}>
              <div className="mb-16 md:mb-24 rounded-xl overflow-hidden border border-[var(--color-border)]
                              bg-[var(--color-bg-elevated)]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-auto object-contain"
                />
              </div>
            </ImageLightbox>
          </FadeInOnScroll>
        )}

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 md:mb-24">
          {/* Description */}
          <div className="lg:col-span-7">
            <FadeInOnScroll>
              <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-[var(--color-accent-text)] mb-6">
                Overview
              </h2>
              <p className="text-[var(--color-text-muted)] leading-[1.8] text-lg">
                {project.fullDescription}
              </p>
            </FadeInOnScroll>
          </div>

          {/* Highlights */}
          <div className="lg:col-span-5">
            <FadeInOnScroll>
              <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-[var(--color-accent-text)] mb-6">
                Key Highlights
              </h2>
            </FadeInOnScroll>
            <StaggerChildren className="space-y-3">
              {project.highlights.map((highlight, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-start gap-3 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                    <span className="text-[var(--color-text-muted)] leading-relaxed text-sm">
                      {highlight}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </div>

        {/* Gallery */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="mb-16 md:mb-24">
            <FadeInOnScroll>
              <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-[var(--color-accent-text)] mb-8">
                Gallery
              </h2>
            </FadeInOnScroll>
            <FadeInOnScroll>
              <ProjectGallery slides={project.gallery} />
            </FadeInOnScroll>
          </div>
        )}

        {/* 3D CAD Model */}
        {cadModels[project.id] && (() => {
          const cad = cadModels[project.id];
          return (
            <div className="mb-16 md:mb-24">
              <FadeInOnScroll>
                <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-[var(--color-accent-text)] mb-2">
                  3D CAD Model
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-8">
                  {cad.label} — drag to rotate, auto-rotates when idle.
                </p>
              </FadeInOnScroll>
              <FadeInOnScroll>
                <CADViewer
                  objPath={cad.objPath}
                  mtlPath={cad.mtlPath}
                  materialOverrides={cad.materialOverrides}
                  zoom={cad.zoom}
                  rotateY={cad.rotateY}
                  height={500}
                />
              </FadeInOnScroll>
            </div>
          );
        })()}

        {/* Detailed Sections */}
        {project.sections && project.sections.length > 0 && (
          <div className="mb-16 md:mb-24 space-y-12">
            <FadeInOnScroll>
              <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-[var(--color-accent-text)] mb-8">
                Deep Dive
              </h2>
            </FadeInOnScroll>
            {project.sections.map((section, i) => (
              <FadeInOnScroll key={i} delay={i * 0.05}>
                <div className="max-w-3xl">
                  <h3 className="text-lg font-bold text-[var(--color-text)] mb-3 font-display">
                    {section.title}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-[1.8]">
                    {section.content}
                  </p>
                  {section.image && (
                    <figure className="mt-6">
                      <ImageLightbox src={section.image} alt={section.imageCaption || section.title}>
                        <div className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)] max-h-[50vh]">
                          <img
                            src={section.image}
                            alt={section.imageCaption || section.title}
                            className="w-full h-full max-h-[50vh] object-contain"
                          />
                        </div>
                      </ImageLightbox>
                      {section.imageCaption && (
                        <figcaption className="mt-3 text-sm text-[var(--color-text-muted)] italic">
                          {section.imageCaption}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        )}

        {/* Interactive Lab */}
        {lab && (
          <div className="mb-16 md:mb-24">
            <FadeInOnScroll>
              <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-[var(--color-accent-text)] mb-2">
                Interactive Lab
              </h2>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">
                {lab.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-8 max-w-3xl">
                {lab.description}
              </p>
            </FadeInOnScroll>
            <FadeInOnScroll>
              <div className="rounded-2xl border border-[var(--color-accent)] bg-[var(--color-bg-elevated)] p-6">
                <lab.component />
              </div>
            </FadeInOnScroll>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-[var(--color-border)] mb-12" />

        {/* Prev / Next navigation */}
        <nav aria-label="Project navigation" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prev ? (
            <Link
              href={`/projects/${prev.id}`}
              className="group flex flex-col gap-2 p-6 rounded-xl border border-[var(--color-border)]
                         hover:border-[var(--color-accent)] transition-colors"
            >
              <span className="text-xs font-mono tracking-wider uppercase text-[var(--color-text-muted)]
                               group-hover:text-[var(--color-accent-text)] transition-colors flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Previous
              </span>
              <span className="font-display font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent-text)] transition-colors">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/projects/${next.id}`}
              className="group flex flex-col gap-2 p-6 rounded-xl border border-[var(--color-border)]
                         hover:border-[var(--color-accent)] transition-colors text-right"
            >
              <span className="text-xs font-mono tracking-wider uppercase text-[var(--color-text-muted)]
                               group-hover:text-[var(--color-accent-text)] transition-colors flex items-center justify-end gap-2">
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
              <span className="font-display font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent-text)] transition-colors">
                {next.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </article>
  );
}
