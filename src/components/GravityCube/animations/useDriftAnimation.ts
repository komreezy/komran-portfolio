import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DriftConfig {
  speed: number;
  range: number;
  enabled: boolean;
}

// Mouse controls spin speed and direction - like a DJ turntable
export function useDriftAnimation(
  meshRef: React.RefObject<THREE.Mesh | null>,
  config: DriftConfig
) {
  const { enabled } = config;
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    if (!meshRef.current || !enabled) return;

    // Keep position fixed
    meshRef.current.position.set(0, 0, 0);

    // Mouse X controls Y-axis spin speed/direction
    // Mouse Y controls X-axis spin speed/direction
    const spinY = mousePos.current.x * config.speed * 0.02 * config.range;
    const spinX = mousePos.current.y * config.speed * 0.015 * config.range;

    meshRef.current.rotation.y += spinY;
    meshRef.current.rotation.x += spinX;
  });
}
