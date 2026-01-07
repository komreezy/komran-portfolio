"use client";

interface BloomMaterialProps {
  color: string;
  intensity: number;
}

export function BloomMaterial({ color, intensity }: BloomMaterialProps) {
  // The bloom effect is applied via postprocessing in the canvas
  // This material just needs to be emissive to trigger bloom
  return (
    <meshBasicMaterial
      wireframe
      color={color}
      toneMapped={false} // Important for bloom to work properly
    />
  );
}
