import type { SkillCategory } from "@/types";

export const skillCategories: SkillCategory[] = [
  {
    category: "Design & Simulation",
    icon: "//",
    skills: [
      { name: "SolidWorks", proficiency: "advanced" },
      { name: "Fusion 360", proficiency: "advanced" },
      { name: "AutoCAD", proficiency: "intermediate" },
      { name: "FEA Analysis", proficiency: "intermediate" },
      { name: "Creo", proficiency: "intermediate" },
    ],
  },
  {
    category: "Software Development",
    icon: "< />",
    skills: [
      { name: "Python", proficiency: "advanced" },
      { name: "C/C++", proficiency: "advanced" },
      { name: "MATLAB/Simulink", proficiency: "advanced" },
      { name: "OpenCV", proficiency: "intermediate" },
      { name: "TypeScript", proficiency: "intermediate" },
      { name: "Git", proficiency: "advanced" },
    ],
  },
  {
    category: "Research & Control",
    icon: "**",
    skills: [
      { name: "Multi-Robot Consensus", proficiency: "advanced" },
      { name: "DAF / APF / ORCA / CBF", proficiency: "advanced" },
      { name: "Lyapunov Analysis", proficiency: "advanced" },
      { name: "Bearing-Based Control", proficiency: "intermediate" },
      { name: "PID Control", proficiency: "expert" },
    ],
  },
  {
    category: "Mechanical & Hardware",
    icon: "{ }",
    skills: [
      { name: "Copper Welding", proficiency: "expert" },
      { name: "Soldering / PCB", proficiency: "advanced" },
      { name: "Servo & Motor Control", proficiency: "advanced" },
      { name: "3D Printing", proficiency: "intermediate" },
      { name: "Sensor Integration", proficiency: "advanced" },
    ],
  },
  {
    category: "Languages",
    icon: ">>",
    skills: [
      { name: "Korean (Native)", proficiency: "expert" },
      { name: "English (Proficient)", proficiency: "expert" },
      { name: "Thai (Basic)", proficiency: "intermediate" },
      { name: "French (Beginner)", proficiency: "learning" },
    ],
  },
];
