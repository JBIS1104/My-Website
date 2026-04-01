"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { projects } from "@/data/projects";

export function ProjectsSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: headingRef,
    offset: ["start end", "start center"],
  });
  const headingScale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const headingOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="projects" className="py-24 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <motion.div ref={headingRef} style={{ scale: headingScale, opacity: headingOpacity }}>
          <FadeInOnScroll>
            <SectionHeading subtitle="Engineering solutions from concept to prototype.">
              Projects
            </SectionHeading>
          </FadeInOnScroll>
        </motion.div>

        <div>
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
