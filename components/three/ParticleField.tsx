"use client";

import { useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import { useTheme } from "next-themes";

let engineInitialized = false;

export function ParticleField() {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(engineInitialized);

  useEffect(() => {
    if (engineInitialized) {
      setReady(true);
      return;
    }
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      engineInitialized = true;
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  const isDark = resolvedTheme === "dark";

  const options: ISourceOptions = {
    fullScreen: false,
    fpsLimit: 60,
    particles: {
      number: {
        value: 35,
        density: { enable: true },
      },
      color: {
        value: isDark ? "#86EFAC" : "#22c55e",
      },
      opacity: {
        value: isDark ? 0.15 : 0.08,
      },
      size: {
        value: { min: 1, max: 2 },
      },
      move: {
        enable: true,
        speed: 0.4,
        direction: "none",
        outModes: { default: "out" },
      },
      links: {
        enable: true,
        distance: 140,
        color: isDark ? "#86EFAC" : "#22c55e",
        opacity: isDark ? 0.06 : 0.04,
        width: 1,
      },
    },
    detectRetina: true,
  };

  return (
    <Particles
      id="tsparticles"
      options={options}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
