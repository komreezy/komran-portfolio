"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// Keyboard state hook - simplified, no shift
function useKeyboard() {
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") setKeys((prev) => ({ ...prev, forward: true }));
      if (key === "s" || key === "arrowdown") setKeys((prev) => ({ ...prev, backward: true }));
      if (key === "a" || key === "arrowleft") setKeys((prev) => ({ ...prev, left: true }));
      if (key === "d" || key === "arrowright") setKeys((prev) => ({ ...prev, right: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") setKeys((prev) => ({ ...prev, forward: false }));
      if (key === "s" || key === "arrowdown") setKeys((prev) => ({ ...prev, backward: false }));
      if (key === "a" || key === "arrowleft") setKeys((prev) => ({ ...prev, left: false }));
      if (key === "d" || key === "arrowright") setKeys((prev) => ({ ...prev, right: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keys;
}

interface CharacterProps {
  keys: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };
}

function Character({ keys }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/avatar-animated.glb");
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Track if we've initialized
  const hasInitialized = useRef(false);
  const currentActionRef = useRef<string | null>(null);

  // Initialize with idle - runs once when actions are ready
  useEffect(() => {
    // Only run once, and only when actions are populated
    if (hasInitialized.current) return;
    if (!actions || Object.keys(actions).length === 0) return;

    console.log("Initializing animations, available:", Object.keys(actions));

    // Stop the mixer completely first
    mixer.stopAllAction();

    // Find and play idle - "Walking" is actually Idle_02 due to Meshy mislabeling
    const idleAction = actions["Walking"];
    if (idleAction) {
      console.log("Playing idle (Walking = Idle_02)");
      idleAction.reset().fadeIn(0.1).play();
      currentActionRef.current = "Walking";
      hasInitialized.current = true;
    } else {
      console.log("Walking not found, available actions:", Object.keys(actions));
    }
  }, [actions, mixer]);

  // Animation switching - corrected for Meshy mislabeling
  useEffect(() => {
    const isMoving = keys.forward || keys.backward || keys.left || keys.right;

    // Meshy labels are wrong: "Run_and_Jump" = actual Walking, "Walking" = actual Idle_02
    const targetAction = isMoving ? "Run_and_Jump" : "Walking";

    if (targetAction && actions[targetAction] && targetAction !== currentActionRef.current) {
      // Fade out current animation
      if (currentActionRef.current && actions[currentActionRef.current]) {
        actions[currentActionRef.current].fadeOut(0.2);
      }
      // Fade in new animation
      actions[targetAction].reset().fadeIn(0.2).play();
      currentActionRef.current = targetAction;
    }
  }, [keys.forward, keys.backward, keys.left, keys.right, actions]);

  // Movement and rotation
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Slower speed to match walk animation pace
    const speed = 1.5;
    const rotationSpeed = 2.5;

    // Rotation
    if (keys.left) {
      groupRef.current.rotation.y += rotationSpeed * delta;
    }
    if (keys.right) {
      groupRef.current.rotation.y -= rotationSpeed * delta;
    }

    // Movement in facing direction (W = forward, S = backward)
    if (keys.forward || keys.backward) {
      // Flipped direction: forward is -1, backward is 1
      const direction = keys.forward ? -1 : 1;
      const moveX = Math.sin(groupRef.current.rotation.y) * speed * delta * direction;
      const moveZ = Math.cos(groupRef.current.rotation.y) * speed * delta * direction;

      // Clamp position to stay in bounds
      const newX = THREE.MathUtils.clamp(groupRef.current.position.x - moveX, -5, 5);
      const newZ = THREE.MathUtils.clamp(groupRef.current.position.z - moveZ, -5, 5);

      groupRef.current.position.x = newX;
      groupRef.current.position.z = newZ;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={scene} scale={1} position={[0, -1, 0]} />
    </group>
  );
}

// Destination marker - glowing light beam
function DestinationMarker() {
  return (
    <group position={[0, 0, -4]}>
      {/* Glowing pillar */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 3, 16]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.99, 0]}>
        <ringGeometry args={[0.5, 0.8, 32]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
    </mesh>
  );
}

// Grid helper for visual reference
function GridHelper() {
  return <gridHelper args={[20, 20, "#333333", "#222222"]} position={[0, -0.99, 0]} />;
}

export default function Avatar3D() {
  const keys = useKeyboard();
  const [hasFocus, setHasFocus] = useState(false);

  return (
    <div
      className="w-full h-[600px] relative rounded-lg overflow-hidden"
      tabIndex={0}
      onFocus={() => setHasFocus(true)}
      onBlur={() => setHasFocus(false)}
    >
      {/* Controls overlay */}
      <div className="absolute top-4 left-4 z-10 text-xs font-mono bg-black/50 backdrop-blur-sm rounded px-3 py-2">
        <div className="text-white/80 mb-1">CONTROLS</div>
        <div className="text-white/60">W/S - Forward/Back</div>
        <div className="text-white/60">A/D - Turn Left/Right</div>
      </div>

      {/* Focus indicator */}
      {!hasFocus && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="text-white text-sm font-mono bg-black/50 px-4 py-2 rounded">
            Click to control
          </div>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 2, 6], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />

        <Suspense fallback={null}>
          <Character keys={keys} />
          <DestinationMarker />
          <Ground />
          <GridHelper />
        </Suspense>

        {/* No OrbitControls - camera is fixed */}
      </Canvas>
    </div>
  );
}

useGLTF.preload("/avatar-animated.glb");
