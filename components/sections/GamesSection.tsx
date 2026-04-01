"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { PIDTunerGame } from "@/components/games/PIDTunerGame";
import { MonitorArmGame } from "@/components/games/MonitorArmGame";
import { SpotDistractedGame } from "@/components/games/SpotDistractedGame";
import { ConsensusSimGame } from "@/components/games/ConsensusSimGame";
import { WedgeArenaGame } from "@/components/games/WedgeArenaGame";
import { ConveyorGame } from "@/components/games/ConveyorGame";

const games = [
  {
    id: "monitor-arm",
    title: "3D Monitor Arm",
    description: "Control Yaw, Height, and Pitch to aim the monitor at the target head.",
    project: "Head-Tracking Monitor Arm",
    icon: "\u{1F5A5}\u{FE0F}",
  },
  {
    id: "consensus",
    title: "DAF Navigation",
    description: "Compare DAF vs APF vs CBF collision avoidance — from my research papers.",
    project: "Multi-Robot Research",
    icon: "\u{1F916}",
  },
  {
    id: "pid-tuner",
    title: "PID Tuner Challenge",
    description: "Tune Kp, Ki, Kd to make the buggy follow the track. Complete 2 laps!",
    project: "Line Following Buggy",
    icon: "\u{1F3CE}\u{FE0F}",
  },
  {
    id: "conveyor",
    title: "Factory Sorter",
    description: "See how motor current detects weight \u2014 no sensor needed!",
    project: "GridBox Smart Factory",
    icon: "\u{1F3ED}",
  },
  {
    id: "hand-detection",
    title: "Hand Detection",
    description: "Spot all students with raised hands before time runs out. Precision vs Recall!",
    project: "AI Camera System",
    icon: "\u{1F4F8}",
  },
  {
    id: "wedge-arena",
    title: "Space Ship Arena",
    description: "Drive your wedge pusher vs a blade spinner. Push into the pit!",
    project: "Combat Robot",
    icon: "\u{2694}\u{FE0F}",
  },
];

// Maps game ID to project ID for "Learn more" scroll link
const gameToProject: Record<string, string> = {
  "pid-tuner": "line-following-buggy",
  "monitor-arm": "monitor-arm",
  "hand-detection": "ai-camera",
  "consensus": "multi-robot-control",
  "conveyor": "gridbox",
  "wedge-arena": "rfl-robot",
};

const gameDescriptions: Record<string, { title: string; description: string }> = {
  "pid-tuner": {
    title: "PID Tuner \u2014 Make the buggy follow the line!",
    description: "Adjust Kp (proportional), Ki (integral), and Kd (derivative) gains. High Kp = aggressive turns but oscillation. Kd = damping. Ki = steady-state correction. Complete 2 laps to get your score.",
  },
  "monitor-arm": {
    title: "3D Monitor Arm \u2014 Aim at the head!",
    description: "Control the RPR arm in 3D: first R is Yaw (horizontal pan), P is Height (vertical extension), last R is Pitch (monitor tilt). Match the real servo control from my Raspberry Pi 5 project!",
  },
  "hand-detection": {
    title: "Hand Detection \u2014 Classroom AI!",
    description: "In 12 seconds, click all students with raised hands. After scanning, see your Precision (no false detections) and Recall (found all hands) \u2014 the same metrics my hackathon AI camera used.",
  },
  "conveyor": {
    title: "Factory Sorter \u2014 GridBox Conveyor!",
    description: "Click the hopper to drop objects onto the conveyor. The system auto-detects weight by measuring the DC motor current \u2014 heavier objects increase the load on the motor, causing a measurable current spike. Watch the real-time current graph on the right: when it crosses the red threshold, the system classifies it as heavy and the servo sorts it into the correct bin. This is exactly how our GridBox factory works \u2014 no weight sensor needed, just current analysis!",
  },
  "wedge-arena": {
    title: "Space Ship Arena \u2014 Combat Robotics!",
    description: "Drive your wedge robot with WASD or arrow keys. Push the blade bot into one of the two pits \u2014 but avoid its spinning blade! Wedge under the opponent for 1.8x push force. First to 3 wins the match.",
  },
  "consensus": {
    title: "DAF Navigation \u2014 Collision Avoidance in Action!",
    description: "Watch 4 robots start in a line formation on the left, navigate around a central obstacle, and converge to the goal on the right \u2014 using the exact DAF control law from my research. Smoothstep gamma function, velocity-dependent braking, inter-robot and obstacle avoidance.",
  },
};

export function GamesSection() {
  const [activeGame, setActiveGame] = useState<string | null>("monitor-arm");

  return (
    <SectionWrapper id="games">
      <FadeInOnScroll>
        <SectionHeading subtitle="Hands-on engineering demos. Learn by doing.">
          Interactive Labs
        </SectionHeading>
      </FadeInOnScroll>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {games.map((game, i) => (
          <FadeInOnScroll key={game.id} delay={i * 0.1}>
            <motion.button
              whileHover={{ y: -4 }}
              onClick={() => setActiveGame(activeGame === game.id ? null : game.id)}
              className={`w-full text-left p-5 rounded-2xl border transition-all duration-300
                         ${activeGame === game.id
                           ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-lg shadow-[var(--color-accent-glow)]"
                           : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-accent)]"
                         }`}
            >
              <span className="text-2xl block mb-2">{game.icon}</span>
              <h3 className="text-sm font-bold text-[var(--color-text)]">{game.title}</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">{game.description}</p>
              <p className="text-xs font-mono text-[var(--color-accent-text)] mt-2 tracking-wider uppercase">
                {game.project}
              </p>
            </motion.button>
          </FadeInOnScroll>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeGame && (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-2xl border border-[var(--color-accent)] bg-[var(--color-bg-elevated)]">
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">
                {gameDescriptions[activeGame]?.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                {gameDescriptions[activeGame]?.description}
              </p>
              {activeGame === "pid-tuner" && <PIDTunerGame />}
              {activeGame === "monitor-arm" && <MonitorArmGame />}
              {activeGame === "hand-detection" && <SpotDistractedGame />}
              {activeGame === "consensus" && <ConsensusSimGame />}
              {activeGame === "conveyor" && <ConveyorGame />}
              {activeGame === "wedge-arena" && <WedgeArenaGame />}

              {/* Learn more button */}
              <a
                href={`#project-${gameToProject[activeGame]}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(`project-${gameToProject[activeGame]}`);
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                           border border-[var(--color-border)] text-[var(--color-text-muted)]
                           hover:border-[var(--color-accent)] hover:text-[var(--color-accent-text)]
                           transition-colors duration-300"
              >
                Learn more about this project
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}
