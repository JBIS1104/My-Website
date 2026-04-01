import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { GamesSection } from "@/components/sections/GamesSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { QuizSection } from "@/components/sections/QuizSection";
import { EasterEggs } from "@/components/ui/EasterEggs";
import { ContactSection } from "@/components/sections/ContactSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { CircuitDivider } from "@/components/ui/CircuitDivider";
import { ParticleFieldLoader } from "@/components/three/ParticleFieldLoader";

export default function Home() {
  return (
    <>
      <ParticleFieldLoader />
      <HeroSection />
      <StatsSection />
      <GamesSection />
      <CircuitDivider variant="step" />
      <ProjectsSection />
      <CircuitDivider variant="damped" />
      <ExperienceSection />
      <QuizSection />
      <CircuitDivider variant="noise" />
      <EasterEggs />
      <ContactSection />
    </>
  );
}
