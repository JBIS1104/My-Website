"use client";

import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TimelineItem } from "@/components/ui/TimelineItem";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/StaggerChildren";
import { experiences } from "@/data/experience";
import { skillCategories } from "@/data/skills";

export function ExperienceSection() {
  return (
    <SectionWrapper id="experience">
      <FadeInOnScroll>
        <SectionHeading subtitle="Where I've been, what I've learned.">
          Experience
        </SectionHeading>
      </FadeInOnScroll>

      {/* Timeline */}
      <div className="mb-24">
        {experiences.map((entry, i) => (
          <TimelineItem key={entry.id} entry={entry} index={i} />
        ))}
      </div>

      {/* Skills */}
      <FadeInOnScroll>
        <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Skills & Tools
        </h3>
        <p className="text-[var(--color-text-muted)] mb-10">
          Technologies and tools I work with regularly.
        </p>
      </FadeInOnScroll>

      <div className="space-y-10">
        {skillCategories.map((category) => (
          <div key={category.category}>
            <FadeInOnScroll>
              <h4 className="text-sm font-mono text-[var(--color-accent)] tracking-wider uppercase mb-4 flex items-center gap-2">
                <span className="opacity-50">{category.icon}</span>
                {category.category}
              </h4>
            </FadeInOnScroll>
            <StaggerChildren className="flex flex-wrap gap-3">
              {category.skills.map((skill) => (
                <StaggerItem key={skill.name}>
                  <SkillBadge
                    name={skill.name}
                    proficiency={skill.proficiency}
                  />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
