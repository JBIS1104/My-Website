import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { ProjectPageContent } from "@/components/sections/ProjectPageContent";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) return {};

  return {
    title: `${project.title} | Junbyung Park`,
    description: project.description,
    openGraph: {
      title: `${project.title} | Junbyung Park`,
      description: project.description,
      type: "article",
      ...(project.image && { images: [{ url: project.image }] }),
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) notFound();

  const project = projects[index];
  const prev = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;

  return <ProjectPageContent project={project} prev={prev} next={next} />;
}
