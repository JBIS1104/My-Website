"use client";
import { PIDTunerGame } from "@/components/games/PIDTunerGame";

export default function PIDTest() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 20, fontFamily: "monospace" }}>PID Test Page</h1>
      <PIDTunerGame />
    </div>
  );
}
