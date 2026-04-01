"use client";

import dynamic from "next/dynamic";

const ParticleField = dynamic(
  () =>
    import("@/components/three/ParticleField").then((mod) => mod.ParticleField),
  { ssr: false }
);

export function ParticleFieldLoader() {
  return <ParticleField />;
}
