import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OrbitConfig {
  speed: number;
  range: number;
  enabled: boolean;
}

// Mouse movement adds rotational momentum that decays
export function useOrbitAnimation(
  meshRef: React.RefObject<THREE.Mesh | null>,
  config: OrbitConfig
) {
  const { enabled } = config;
  const velocity = useRef({ x: 0, y: 0 });
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const currentX = (e.clientX / window.innerWidth) * 2 - 1;
      const currentY = -(e.clientY / window.innerHeight) * 2 + 1;

      // Add velocity based on mouse movement delta
      velocity.current.x += (currentY - lastMouse.current.y) * config.range * 0.5;
      velocity.current.y += (currentX - lastMouse.current.x) * config.range * 0.5;

      lastMouse.current.x = currentX;
      lastMouse.current.y = currentY;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [config.range]);

  useFrame(() => {
    if (!meshRef.current || !enabled) return;

    // Keep position fixed
    meshRef.current.position.set(0, 0, 0);

    // Apply velocity to rotation
    meshRef.current.rotation.x += velocity.current.x * config.speed * 0.1;
    meshRef.current.rotation.y += velocity.current.y * config.speed * 0.1;

    // Decay velocity (momentum loss)
    velocity.current.x *= 0.98;
    velocity.current.y *= 0.98;

    // Add tiny base rotation so it never fully stops
    meshRef.current.rotation.y += 0.001 * config.speed;
  });
}
