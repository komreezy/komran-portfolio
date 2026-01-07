"use client";

import { useRef } from "react";
import * as THREE from "three";

// Animations
import { useTiltAnimation } from "./animations/useTiltAnimation";
import { useDriftAnimation } from "./animations/useDriftAnimation";
import { useOrbitAnimation } from "./animations/useOrbitAnimation";
import { useTumbleAnimation } from "./animations/useTumbleAnimation";

// Effects
import { SparklesEffect } from "./effects/SparklesEffect";

export type AnimationType = "tilt" | "drift" | "orbit" | "tumble";

interface CubeProps {
  animation: AnimationType;
  color: string;
  speed: number;
  range: number;
  size: number;
}

export function Cube({
  animation,
  color,
  speed,
  range,
  size,
}: CubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Call all animation hooks unconditionally (React rules of hooks)
  useTiltAnimation(meshRef, { speed, range, enabled: animation === "tilt" });
  useDriftAnimation(meshRef, { speed, range, enabled: animation === "drift" });
  useOrbitAnimation(meshRef, { speed, range, enabled: animation === "orbit" });
  useTumbleAnimation(meshRef, { speed, range, enabled: animation === "tumble" });

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[size, size, size]} />
        <meshBasicMaterial wireframe color={color} />
      </mesh>
      <SparklesEffect color={color} intensity={1} />
    </group>
  );
}
