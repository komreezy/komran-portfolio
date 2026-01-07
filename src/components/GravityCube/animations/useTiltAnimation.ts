import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TiltConfig {
  speed: number;
  range: number;
  enabled: boolean;
}

// Cube tilts toward mouse cursor like a compass
export function useTiltAnimation(
  meshRef: React.RefObject<THREE.Mesh | null>,
  config: TiltConfig
) {
  const { enabled } = config;
  const mousePos = useRef({ x: 0, y: 0 });
  const currentTilt = useRef({ x: 0, y: 0 });

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

    // Target tilt based on mouse position
    const maxTilt = config.range * 0.5;
    const targetTiltX = mousePos.current.y * maxTilt;
    const targetTiltY = mousePos.current.x * maxTilt;

    // Smooth lerp toward target
    currentTilt.current.x += (targetTiltX - currentTilt.current.x) * config.speed * 0.08;
    currentTilt.current.y += (targetTiltY - currentTilt.current.y) * config.speed * 0.08;

    meshRef.current.rotation.x = currentTilt.current.x;
    meshRef.current.rotation.y = currentTilt.current.y;
  });
}
