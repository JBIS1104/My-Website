import type { ExperienceEntry } from "@/types";

export const experiences: ExperienceEntry[] = [
  {
    id: "research",
    title: "Multi-Robot Control Researcher",
    organization: "University of Manchester",
    period: "2025 — Present",
    description:
      "Independent research comparing DAF, APF, ORCA, and CBF collision avoidance algorithms for multi-robot consensus, working towards PhD application.",
    highlights: [
      "Systematic comparison across path, cycle, and complete graph topologies",
      "Lyapunov stability proofs and energy-based safety analysis",
      "Identified novel gap: bearing-only DAF consensus on general graphs",
      "Working with Dr. Zhiqi Tang on PhD research direction",
    ],
  },
  {
    id: "education",
    title: "BEng Mechatronics Engineering",
    organization: "University of Manchester",
    period: "Sep 2021 — Jun 2022, Sep 2024 — Jun 2026",
    description:
      "Predicted First Class BEng. Completed 1st year 2021-22, paused for 2 years military service, returned Sep 2024 to continue.",
    highlights: [
      "Predicted First Class (1st) classification",
      "Key modules: Control Theory, Machine Learning, Robotics, FEA, Embedded Systems",
      "3rd Place — UoM Hackathon 2025",
      "UoM Robotics Society — Antweight Fighting League competitor",
    ],
  },
  {
    id: "military",
    title: "Facility Maintenance Engineer — F-35 Program",
    organization: "17th Fighter Wing, Republic of Korea Air Force",
    period: "Jun 2022 — Jun 2024",
    description:
      "2 years mandatory military service. Maintained mission-critical electrical, mechanical, and environmental systems supporting F-35 fighter jet operations in a zero-downtime environment.",
    highlights: [
      "+17% reliability improvement across all maintained systems",
      "Self-taught copper welding to replace temporary pipe fixes permanently",
      "Rewrote boiler room maintenance manuals from scratch for clarity",
      "Mentored junior technicians with step-by-step training guides",
      "HVAC, water supply, drainage, and boiler system maintenance",
    ],
  },
  {
    id: "a-levels",
    title: "A-Levels: A*A*A*A",
    organization: "Kajonkiet International School, Phuket, Thailand",
    period: "2019 — Jun 2021",
    description:
      "Physics A*, Chemistry A*, Further Maths A*, Maths A. Gold Medal in International Mathematics Olympiad, 2x Bronze in Science Olympiads.",
    highlights: [
      "Gold Medal — International Mathematics Olympiad",
      "2x Bronze Medals — Science Olympiads",
      "School Prefect and Volleyball Team Leader",
    ],
  },
];
