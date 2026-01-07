"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FlickerMaterialProps {
  color: string;
  intensity: number;
}

export function FlickerMaterial({ color, intensity }: FlickerMaterialProps) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!materialRef.current) return;

    // Random flicker effect
    const flicker = 0.5 + Math.random() * 0.5 * intensity;
    materialRef.current.opacity = flicker;

    // Occasional color shift for "electrical" feel
    if (Math.random() > 0.95) {
      const hsl = { h: 0, s: 0, l: 0 };
      new THREE.Color(color).getHSL(hsl);
      materialRef.current.color.setHSL(
        hsl.h + (Math.random() - 0.5) * 0.1,
        hsl.s,
        hsl.l + (Math.random() - 0.5) * 0.2
      );
    } else {
      materialRef.current.color.set(color);
    }
  });

  return (
    <meshBasicMaterial
      ref={materialRef}
      wireframe
      color={color}
      transparent
      opacity={1}
    />
  );
}
