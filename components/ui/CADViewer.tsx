"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

interface CADViewerProps {
  objPath: string;
  mtlPath: string;
  /** Override specific group materials: groupName → hex color */
  materialOverrides?: Record<string, { color: string; metalness?: number; roughness?: number; emissive?: string; emissiveIntensity?: number }>;
  /** Camera distance multiplier (default 1) */
  zoom?: number;
  /** Initial Y rotation in degrees (default 0) */
  rotateY?: number;
  /** Auto-rotate speed (default 0.003) */
  autoRotateSpeed?: number;
  /** Height in pixels */
  height?: number;
}

function Model({
  objPath,
  mtlPath,
  materialOverrides,
  zoom = 1,
  rotateY = 0,
  autoRotateSpeed = 0.003,
}: CADViewerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [loaded, setLoaded] = useState(false);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0, y: (rotateY * Math.PI) / 180 });

  useEffect(() => {
    const mtlLoader = new MTLLoader();
    const dir = mtlPath.substring(0, mtlPath.lastIndexOf("/") + 1);
    const mtlFile = mtlPath.substring(mtlPath.lastIndexOf("/") + 1);
    mtlLoader.setPath(dir);
    mtlLoader.load(mtlFile, (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      const objDir = objPath.substring(0, objPath.lastIndexOf("/") + 1);
      const objFile = objPath.substring(objPath.lastIndexOf("/") + 1);
      objLoader.setPath(objDir);
      objLoader.load(objFile, (obj) => {
        // Compute bounding box for centering & scaling
        const box = new THREE.Box3().setFromObject(obj);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = (2.5 / maxDim) * zoom;

        // Apply material overrides
        const overrideMats: Record<string, THREE.MeshStandardMaterial> = {};
        if (materialOverrides) {
          for (const [name, props] of Object.entries(materialOverrides)) {
            overrideMats[name] = new THREE.MeshStandardMaterial({
              color: new THREE.Color(props.color),
              metalness: props.metalness ?? 0.3,
              roughness: props.roughness ?? 0.5,
              ...(props.emissive && {
                emissive: new THREE.Color(props.emissive),
                emissiveIntensity: props.emissiveIntensity ?? 0.05,
              }),
            });
          }
        }

        // Default theme material
        const defaultMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#86EFAC"),
          metalness: 0.25,
          roughness: 0.5,
          emissive: new THREE.Color("#86EFAC"),
          emissiveIntensity: 0.03,
        });

        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const name = child.name || child.parent?.name || "";
            if (overrideMats[name]) {
              child.material = overrideMats[name];
            } else {
              child.material = defaultMat;
            }
          }
        });

        // Center, scale, and rotate Z-up → Y-up
        obj.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
        obj.scale.setScalar(scale);

        // Wrap in a pivot group that converts Z-up (CAD) to Y-up (Three.js)
        const pivot = new THREE.Group();
        pivot.rotation.x = -Math.PI / 2;
        pivot.add(obj);

        if (groupRef.current) {
          groupRef.current.add(pivot);
        }
        setLoaded(true);
      });
    });
  }, [objPath, mtlPath, zoom, materialOverrides]);

  // Drag to rotate
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      rotation.current.y += dx * 0.01;
      rotation.current.x -= dy * 0.01;
      rotation.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotation.current.x));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    // Auto-rotate when not dragging
    if (!isDragging.current) {
      rotation.current.y += autoRotateSpeed;
    }
    groupRef.current.rotation.order = "YXZ";
    groupRef.current.rotation.y = rotation.current.y;
    groupRef.current.rotation.x = rotation.current.x;
  });

  return <group ref={groupRef} />;
}

export function CADViewer({
  objPath,
  mtlPath,
  materialOverrides,
  zoom = 1,
  rotateY = 0,
  autoRotateSpeed = 0.003,
  height = 400,
}: CADViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors duration-500 bg-[var(--color-bg-elevated)]"
      style={{ height }}
    >
      {mounted ? (
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: "100%", height: "100%", cursor: "grab" }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <directionalLight position={[-4, -2, 3]} intensity={0.4} />
          <pointLight position={[0, 3, 4]} intensity={0.5} />
          <Model
            objPath={objPath}
            mtlPath={mtlPath}
            materialOverrides={materialOverrides}
            zoom={zoom}
            rotateY={rotateY}
            autoRotateSpeed={autoRotateSpeed}
          />
        </Canvas>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm font-mono text-[var(--color-text-muted)] animate-pulse">
            Loading 3D Model...
          </div>
        </div>
      )}
      <div className="absolute bottom-3 right-3 text-[10px] font-mono tracking-widest uppercase text-[var(--color-text-muted)] opacity-40 pointer-events-none">
        Drag to rotate
      </div>
    </div>
  );
}
