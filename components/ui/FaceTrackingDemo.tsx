"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

// ── Joint hierarchy ──
// STATIC: base plate + lower cylinder (below the yaw bearing)
const STATIC_GROUPS = new Set(["Body1:11", "Body1:10"]);

// YAW only: upper cylinder + arm columns + joint hardware (rotates but doesn't tilt)
const YAW_ONLY_GROUPS = new Set([
  "Body1:4", "Body1:2", "Body1:3", "Body1:1", "Body1:9",
  "Body2", "Body1",
]);

// TILT (child of yaw): half-moon brackets + head + iPad + all top parts
// Everything not in STATIC or YAW_ONLY is tilt
const SCREEN_GROUPS = new Set(["Body2:1", "Body4", "Body5"]);

function createMaterials() {
  return {
    body: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#86EFAC"),
      metalness: 0.25,
      roughness: 0.5,
      emissive: new THREE.Color("#86EFAC"),
      emissiveIntensity: 0.03,
    }),
    screen: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#050505"),
      metalness: 0.95,
      roughness: 0.05,
    }),
    baseMat: new THREE.MeshStandardMaterial({
      color: new THREE.Color("#5fd99a"),
      metalness: 0.35,
      roughness: 0.45,
    }),
  };
}

function MonitorArmModel() {
  const staticRef = useRef<THREE.Group>(null);
  const yawRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const [loaded, setLoaded] = useState(false);

  const mouse = useRef({ x: 0, y: 0 });
  const smooth = useRef({ yaw: 0, pitch: 0 });

  // From analysis: model spans ~39 units in Z
  // Yaw pivot: center of cylinders at ~(0, 0, 5) in model coords
  // Tilt pivot: through half-moon brackets at ~(0, 10.4, 27.5) in model coords
  const MODEL_CENTER = new THREE.Vector3(0, 7.5, 19); // rough visual center
  const SCALE = 0.055; // ~39 units * 0.055 ≈ 2.1 three.js units

  // Pivot points in model space
  const YAW_PIVOT = new THREE.Vector3(0, 0, 5);
  const TILT_PIVOT = new THREE.Vector3(0, 10.4, 27.5);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath("/models/");
    mtlLoader.load("MonitorArmOBJ.mtl", (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath("/models/");
      objLoader.load("MonitorArmOBJ.obj", (obj) => {
        const mats = createMaterials();

        obj.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const name = child.name || child.parent?.name || "";

          // Assign material
          if (SCREEN_GROUPS.has(name)) {
            child.material = mats.screen;
          } else if (STATIC_GROUPS.has(name)) {
            child.material = mats.baseMat;
          } else {
            child.material = mats.body;
          }

          const clone = child.clone();
          clone.scale.setScalar(SCALE);

          if (STATIC_GROUPS.has(name)) {
            // Position relative to scene center
            clone.position.set(
              -MODEL_CENTER.x * SCALE,
              -MODEL_CENTER.y * SCALE,
              -MODEL_CENTER.z * SCALE
            );
            staticRef.current?.add(clone);
          } else if (YAW_ONLY_GROUPS.has(name)) {
            // Position relative to yaw pivot
            clone.position.set(
              -(YAW_PIVOT.x) * SCALE,
              -(YAW_PIVOT.y) * SCALE,
              -(YAW_PIVOT.z) * SCALE
            );
            yawRef.current?.add(clone);
          } else {
            // Tilt group: position relative to tilt pivot
            clone.position.set(
              -(TILT_PIVOT.x) * SCALE,
              -(TILT_PIVOT.y) * SCALE,
              -(TILT_PIVOT.z) * SCALE
            );
            tiltRef.current?.add(clone);
          }
        });

        // Position yaw group at yaw pivot in scene space
        if (yawRef.current) {
          yawRef.current.position.set(
            (YAW_PIVOT.x - MODEL_CENTER.x) * SCALE,
            (YAW_PIVOT.y - MODEL_CENTER.y) * SCALE,
            (YAW_PIVOT.z - MODEL_CENTER.z) * SCALE
          );
        }

        // Position tilt group at tilt pivot in yaw-local space
        if (tiltRef.current) {
          tiltRef.current.position.set(
            (TILT_PIVOT.x - YAW_PIVOT.x) * SCALE,
            (TILT_PIVOT.y - YAW_PIVOT.y) * SCALE,
            (TILT_PIVOT.z - YAW_PIVOT.z) * SCALE
          );
        }

        setLoaded(true);
      });
    });
  }, []);

  useFrame(() => {
    const targetYaw = mouse.current.x * 1.0;
    const targetPitch = mouse.current.y * 0.6;

    smooth.current.yaw += (targetYaw - smooth.current.yaw) * 0.06;
    smooth.current.pitch += (targetPitch - smooth.current.pitch) * 0.06;

    // Yaw: rotate around Z axis (vertical in model space)
    if (yawRef.current) {
      yawRef.current.rotation.z = smooth.current.yaw;
    }

    // Tilt: rotate around X axis (horizontal), inherits yaw from parent
    if (tiltRef.current) {
      tiltRef.current.rotation.x = smooth.current.pitch;
    }
  });

  // Hierarchy: root > static + yaw > [arm parts + tilt > [head parts]]
  // Root rotation: 180° Z to face front
  return (
    <group rotation={[0, 0, Math.PI]}>
      <group ref={staticRef} />
      <group ref={yawRef}>
        <group ref={tiltRef} />
      </group>
    </group>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-sm font-mono text-[var(--color-text-muted)] animate-pulse">
        Loading 3D Model...
      </div>
    </div>
  );
}

export function FaceTrackingDemo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors duration-500 bg-[var(--color-bg-elevated)]"
      style={{ height: 400 }}
    >
      {mounted ? (
        <Canvas
          camera={{ position: [0, -5, 2.5], fov: 35, up: [0, 0, 1] }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: "100%", height: "100%" }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, -5, 8]} intensity={1.5} />
          <directionalLight position={[-4, 3, 3]} intensity={0.4} />
          <pointLight position={[0, -3, 6]} intensity={0.5} />
          <MonitorArmModel />
        </Canvas>
      ) : (
        <LoadingFallback />
      )}
      <div className="absolute top-3 left-3 text-xs font-mono tracking-widest uppercase text-[var(--color-text-muted)] opacity-60 pointer-events-none">
        Head-Tracking Monitor Arm — Move your mouse
      </div>
    </div>
  );
}
