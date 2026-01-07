"use client";

import { Sparkles } from "@react-three/drei";

interface SparklesEffectProps {
  color: string;
  intensity: number;
}

export function SparklesEffect({ color, intensity }: SparklesEffectProps) {
  return (
    <Sparkles
      count={Math.floor(50 * intensity)}
      scale={3}
      size={2 * intensity}
      speed={0.4}
      color={color}
      opacity={0.8}
    />
  );
}
