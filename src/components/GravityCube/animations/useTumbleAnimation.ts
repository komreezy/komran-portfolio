import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TumbleConfig {
  speed: number;
  range: number;
  enabled: boolean;
}

// Constant smooth rotation - mouse proximity causes tempo change
export function useTumbleAnimation(
  meshRef: React.RefObject<THREE.Mesh | null>,
  config: TumbleConfig
) {
  const { enabled } = config;
  const mouseDistance = useRef(1);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      // Distance from center (0-1.4 range, normalized to 0-1)
      mouseDistance.current = Math.min(Math.sqrt(x * x + y * y), 1.4) / 1.4;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    if (!meshRef.current || !enabled) return;

    // Keep position fixed
    meshRef.current.position.set(0, 0, 0);

    // Speed multiplier: faster when mouse is near center, slower at edges
    const speedMult = 0.5 + (1 - mouseDistance.current) * config.range;

    // Smooth continuous rotation on all axes
    meshRef.current.rotation.x += 0.005 * config.speed * speedMult;
    meshRef.current.rotation.y += 0.007 * config.speed * speedMult;
    meshRef.current.rotation.z += 0.003 * config.speed * speedMult;
  });
}
