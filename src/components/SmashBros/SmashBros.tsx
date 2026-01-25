"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// Platform data for Battlefield-style stage
// y is the TOP surface of the platform (where feet land)
const PLATFORMS = [
  { x: 0, y: -1.5, width: 12, height: 0.5 },   // Main platform
  { x: -4, y: 1.5, width: 3, height: 0.3 },    // Left floating
  { x: 4, y: 1.5, width: 3, height: 0.3 },     // Right floating
  { x: 0, y: 3.5, width: 3, height: 0.3 },     // Top center
];

// Physics constants
const GRAVITY = -30;
const JUMP_FORCE = 14;
const MOVE_SPEED = 8;
const AIR_CONTROL = 0.8;

// Platform component - y is the top surface
function Platform({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  // Position mesh so its top surface is at y
  const meshY = y - height / 2;
  return (
    <mesh position={[x, meshY, 0]}>
      <boxGeometry args={[width, height, 2]} />
      <meshStandardMaterial color="#444455" roughness={0.8} />
    </mesh>
  );
}

// Battlefield Stage
function Stage() {
  return (
    <group>
      {PLATFORMS.map((plat, i) => (
        <Platform key={i} {...plat} />
      ))}
      {/* Stage decoration - edge line on main platform */}
      <mesh position={[0, PLATFORMS[0].y + 0.05, 0]}>
        <boxGeometry args={[PLATFORMS[0].width + 0.2, 0.1, 2.2]} />
        <meshStandardMaterial color="#666677" />
      </mesh>
    </group>
  );
}

// Character with physics - uses refs for real-time key state
function Character({ keysRef }: { keysRef: React.MutableRefObject<{ left: boolean; right: boolean; jump: boolean; attack: boolean }> }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/avatar-animated.glb");
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Physics state as refs for performance
  const posRef = useRef({ x: 0, y: 5 });
  const velRef = useRef({ x: 0, y: 0 });
  const groundedRef = useRef(false);
  const facingRightRef = useRef(true);
  const canDoubleJumpRef = useRef(false);
  const jumpWasPressed = useRef(false);
  const attackWasPressed = useRef(false);
  const isAttacking = useRef(false);

  const hasInitialized = useRef(false);
  const currentActionRef = useRef<string | null>(null);

  // Initialize animation
  useEffect(() => {
    if (hasInitialized.current) return;
    if (!actions || Object.keys(actions).length === 0) return;

    console.log("Available animations:", Object.keys(actions));

    mixer.stopAllAction();
    const idleAction = actions["Walking"];
    if (idleAction) {
      idleAction.reset().fadeIn(0.1).play();
      currentActionRef.current = "Walking";
      hasInitialized.current = true;
    }
  }, [actions, mixer]);

  // Check if feet (at posY) would land on any platform
  const checkPlatformCollision = (x: number, feetY: number, vy: number): { landed: boolean; surfaceY: number } => {
    const charHalfWidth = 0.3;

    for (const plat of PLATFORMS) {
      const platLeft = plat.x - plat.width / 2;
      const platRight = plat.x + plat.width / 2;
      const platTop = plat.y;

      // Check if within horizontal bounds
      if (x >= platLeft - charHalfWidth && x <= platRight + charHalfWidth) {
        // Check if falling onto platform (feet at or below surface, and moving down)
        if (vy <= 0 && feetY <= platTop + 0.3 && feetY >= platTop - 0.5) {
          return { landed: true, surfaceY: platTop };
        }
      }
    }

    return { landed: false, surfaceY: feetY };
  };

  // Physics and animation update
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const keys = keysRef.current;
    let { x, y } = posRef.current;
    let { x: vx, y: vy } = velRef.current;
    let grounded = groundedRef.current;
    let facingRight = facingRightRef.current;
    let canDoubleJump = canDoubleJumpRef.current;

    // Horizontal movement
    const moveMultiplier = grounded ? 1 : AIR_CONTROL;
    if (keys.left) {
      vx = -MOVE_SPEED * moveMultiplier;
      facingRight = false;
    } else if (keys.right) {
      vx = MOVE_SPEED * moveMultiplier;
      facingRight = true;
    } else {
      vx = grounded ? vx * 0.8 : vx * 0.98;
      if (Math.abs(vx) < 0.1) vx = 0;
    }

    // Jump logic - detect press edge
    if (keys.jump && !jumpWasPressed.current) {
      if (grounded) {
        vy = JUMP_FORCE;
        grounded = false;
        canDoubleJump = true;
      } else if (canDoubleJump) {
        vy = JUMP_FORCE * 0.85;
        canDoubleJump = false;
      }
    }
    jumpWasPressed.current = keys.jump;

    // Apply gravity when not grounded
    if (!grounded) {
      vy += GRAVITY * delta;
    }

    // Update position
    x += vx * delta;
    y += vy * delta;

    // Check platform collision (y is feet position)
    const collision = checkPlatformCollision(x, y, vy);
    if (collision.landed && vy <= 0) {
      y = collision.surfaceY;
      vy = 0;
      grounded = true;
      canDoubleJump = false;
    } else {
      grounded = false;
    }

    // Fall off stage - respawn
    if (y < -10) {
      x = 0;
      y = 5;
      vx = 0;
      vy = 0;
    }

    // Horizontal bounds
    x = Math.max(-15, Math.min(15, x));

    // Store state
    posRef.current = { x, y };
    velRef.current = { x: vx, y: vy };
    groundedRef.current = grounded;
    facingRightRef.current = facingRight;
    canDoubleJumpRef.current = canDoubleJump;

    // Update mesh - model origin is at feet, so position directly at feet Y
    groupRef.current.position.x = x;
    groupRef.current.position.y = y;
    groupRef.current.rotation.y = facingRight ? Math.PI / 2 : -Math.PI / 2;

    // Attack animation (one-shot) - "Running" is Counterstrike in Meshy mislabeling
    if (keys.attack && !attackWasPressed.current && !isAttacking.current && actions) {
      const attackAction = actions["Running"];
      if (attackAction) {
        isAttacking.current = true;

        // Fade out current animation
        if (currentActionRef.current && actions[currentActionRef.current]) {
          actions[currentActionRef.current]!.fadeOut(0.1);
        }

        // Play attack as one-shot
        attackAction.reset();
        attackAction.setLoop(THREE.LoopOnce, 1);
        attackAction.clampWhenFinished = false;
        attackAction.fadeIn(0.1).play();
        currentActionRef.current = "Running";

        // Reset after animation duration (approx 0.8 seconds)
        setTimeout(() => {
          isAttacking.current = false;
        }, 800);
      }
    }
    attackWasPressed.current = keys.attack;

    // Update animation (only if not attacking)
    if (!isAttacking.current) {
      const isMoving = keys.left || keys.right;
      let targetAction = isMoving ? "Run_and_Jump" : "Walking";
      if (!grounded) {
        targetAction = "Idle_02";
      }

      if (actions && targetAction !== currentActionRef.current) {
        const targetAnimAction = actions[targetAction];
        if (targetAnimAction) {
          if (currentActionRef.current && actions[currentActionRef.current]) {
            actions[currentActionRef.current]?.fadeOut(0.15);
          }
          targetAnimAction.reset().fadeIn(0.15).play();
          currentActionRef.current = targetAction;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 5, 0]}>
      <primitive object={scene} scale={1} />
    </group>
  );
}

// Game canvas component
function SmashBrosGame({ keysRef }: { keysRef: React.MutableRefObject<{ left: boolean; right: boolean; jump: boolean; attack: boolean }> }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 15], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'linear-gradient(to bottom, #1a1a2e, #16213e)' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />

      <Suspense fallback={null}>
        <Stage />
        <Character keysRef={keysRef} />
      </Suspense>
    </Canvas>
  );
}

// Main component - always fullscreen, ESC goes back to lab
interface SmashBrosProps {
  onClose: () => void;
}

export default function SmashBros({ onClose }: SmashBrosProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use ref for keys so useFrame always has current values
  const keysRef = useRef({
    left: false,
    right: false,
    jump: false,
    attack: false,
  });

  // For re-render on mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.classList.add('game-active');

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // Prevent default for game keys
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'x', 'X'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      const keyLower = key.toLowerCase();
      if (keyLower === 'a' || key === 'ArrowLeft') keysRef.current.left = true;
      if (keyLower === 'd' || key === 'ArrowRight') keysRef.current.right = true;
      if (keyLower === 'w' || key === 'ArrowUp' || key === ' ') keysRef.current.jump = true;
      if (keyLower === 'x') {
        console.log("X pressed - attack!");
        keysRef.current.attack = true;
      }
      if (key === 'Escape') onClose();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key;
      const keyLower = key.toLowerCase();
      if (keyLower === 'a' || key === 'ArrowLeft') keysRef.current.left = false;
      if (keyLower === 'd' || key === 'ArrowRight') keysRef.current.right = false;
      if (keyLower === 'w' || key === 'ArrowUp' || key === ' ') keysRef.current.jump = false;
      if (keyLower === 'x') keysRef.current.attack = false;
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });

    containerRef.current?.focus();

    return () => {
      document.body.classList.remove('game-active');
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, [onClose]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* Back button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/50 px-4 py-2 rounded font-mono text-sm transition-colors"
        style={{ outline: 'none' }}
      >
        [ESC] Back to Lab
      </button>

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 z-10 text-xs font-mono bg-black/50 backdrop-blur-sm rounded px-3 py-2">
        <div className="text-white/80 mb-1">CONTROLS</div>
        <div className="text-white/60">A/D or ←/→ - Move</div>
        <div className="text-white/60">W/↑/SPACE - Jump</div>
        <div className="text-white/60">X - Attack</div>
        <div className="text-white/60">Double jump available</div>
      </div>

      <SmashBrosGame keysRef={keysRef} />
    </div>
  );
}

useGLTF.preload("/avatar-animated.glb");
