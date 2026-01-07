"use client";

import { useRef, useMemo } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";

// Extend Three.js Line to make it available as a JSX element
extend({ Line_: THREE.Line });

interface LightningEffectProps {
  color: string;
  intensity: number;
  cubeSize: number;
}

function LightningArc({ color, intensity, cubeSize }: { color: string; intensity: number; cubeSize: number }) {
  const lineRef = useRef<THREE.Line>(null);

  // Cube vertices
  const vertices = useMemo(() => {
    const half = cubeSize / 2;
    return [
      [-half, -half, -half],
      [half, -half, -half],
      [half, half, -half],
      [-half, half, -half],
      [-half, -half, half],
      [half, -half, half],
      [half, half, half],
      [-half, half, half],
    ] as [number, number, number][];
  }, [cubeSize]);

  // Create geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(9 * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!lineRef.current) return;

    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const material = lineRef.current.material as THREE.LineBasicMaterial;

    // Randomly regenerate arc occasionally
    if (Math.random() > 0.97 * (1 / intensity)) {
      const startIdx = Math.floor(Math.random() * vertices.length);
      let endIdx = Math.floor(Math.random() * vertices.length);
      if (endIdx === startIdx) endIdx = (startIdx + 1) % vertices.length;

      const start = vertices[startIdx];
      const end = vertices[endIdx];

      // Create jagged path between points
      const segments = 8;
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const x = start[0] + (end[0] - start[0]) * t;
        const y = start[1] + (end[1] - start[1]) * t;
        const z = start[2] + (end[2] - start[2]) * t;

        // Add jitter (except at endpoints)
        const jitter = j > 0 && j < segments ? 0.15 * intensity : 0;
        positions.setXYZ(
          j,
          x + (Math.random() - 0.5) * jitter,
          y + (Math.random() - 0.5) * jitter,
          z + (Math.random() - 0.5) * jitter
        );
      }
      positions.needsUpdate = true;
      material.opacity = 0.8 + Math.random() * 0.2;
    } else {
      // Fade out
      material.opacity *= 0.95;
    }
  });

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 }))} ref={lineRef} />
  );
}

export function LightningEffect({ color, intensity, cubeSize }: LightningEffectProps) {
  const lineCount = Math.floor(3 * intensity);

  return (
    <group>
      {Array.from({ length: lineCount }, (_, i) => (
        <LightningArc key={i} color={color} intensity={intensity} cubeSize={cubeSize} />
      ))}
    </group>
  );
}
