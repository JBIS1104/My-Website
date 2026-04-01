export interface GallerySlide {
  image: string;
  caption: string;
}

export interface ProjectSection {
  title: string;
  content: string;
  image?: string;
  imageCaption?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  fullDescription: string;
  techStack: string[];
  image?: string;
  gallery?: GallerySlide[];
  links: {
    github?: string;
    demo?: string;
    paper?: string;
  };
  highlights: string[];
  sections?: ProjectSection[];
}

export interface ExperienceEntry {
  id: string;
  title: string;
  organization: string;
  period: string;
  description: string;
  highlights: string[];
}

export interface SkillCategory {
  category: string;
  icon: string;
  skills: {
    name: string;
    proficiency: "learning" | "intermediate" | "advanced" | "expert";
  }[];
}
