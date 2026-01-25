"use client";

import { useRef, useEffect, useCallback } from "react";
import { useGradientAnimation } from "./useGradientAnimation";
import { useMouseRipple } from "./useMouseRipple";
import { useHexGrid } from "./useHexGrid";

// Multi-color palette
const COLORS = [
  { r: 147, g: 51, b: 234 },   // Purple #9333EA
  { r: 59, g: 130, b: 246 },   // Blue #3B82F6
  { r: 236, g: 72, b: 153 },   // Pink #EC4899
  { r: 249, g: 115, b: 22 },   // Orange #F97316
  { r: 6, g: 182, b: 212 },    // Cyan #06B6D4
];

const MAX_DPR = 2;
const CURSOR_GLOW_RADIUS = 0;

export default function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const reducedMotionRef = useRef<boolean>(false);
  const cursorGlowIntensityRef = useRef<number>(0); // For smooth intensity lerping

  const { updateBlobs, resetBlobs } = useGradientAnimation();
  const { getMousePosition, getVelocity, updateRipples } = useMouseRipple(canvasRef);
  const { updateGrid, resetGrid, config: hexConfig } = useHexGrid();

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    return { ctx, width: rect.width, height: rect.height };
  }, []);

  const drawCursorGlow = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      mouseX: number,
      mouseY: number,
      velocity: number,
      width: number,
      height: number
    ) => {
      // Calculate target intensity based on velocity (reduced sensitivity)
      const velocityFactor = Math.min(velocity / 25, 1); // Increased from 15 for smoother response
      const baseIntensity = 0.25; // Brighter for tablecloth lift effect
      const intensityBoost = velocityFactor * 0.1;
      const targetIntensity = baseIntensity + intensityBoost;

      // Lerp current intensity towards target for smooth fade in/out
      const lerpSpeed = 0.02; // Even slower lerping for gradual transitions
      cursorGlowIntensityRef.current += (targetIntensity - cursorGlowIntensityRef.current) * lerpSpeed;
      const intensity = cursorGlowIntensityRef.current;

      // Draw multiple overlapping color glows for prismatic effect
      const offsets = [
        { dx: -15, dy: -10, colorIndex: 0 }, // Purple
        { dx: 15, dy: -5, colorIndex: 1 },   // Blue
        { dx: 0, dy: 12, colorIndex: 2 },    // Pink
      ];

      offsets.forEach(({ dx, dy, colorIndex }) => {
        const color = COLORS[colorIndex];
        const gradient = ctx.createRadialGradient(
          mouseX + dx,
          mouseY + dy,
          0,
          mouseX + dx,
          mouseY + dy,
          CURSOR_GLOW_RADIUS
        );

        gradient.addColorStop(
          0,
          `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.8})`
        );
        gradient.addColorStop(
          0.4,
          `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.4})`
        );
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });
    },
    []
  );

  const drawMultiRingRipple = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      ripple: { x: number; y: number; radius: number; maxRadius: number; opacity: number; colorIndex: number },
      width: number,
      height: number
    ) => {
      const progress = ripple.radius / ripple.maxRadius;
      const color = COLORS[ripple.colorIndex % COLORS.length];

      // Draw 3 concentric rings
      const ringOffsets = [0, 0.15, 0.3];
      const ringOpacities = [1, 0.6, 0.3];

      ringOffsets.forEach((offset, i) => {
        const ringProgress = Math.max(0, progress - offset);
        if (ringProgress <= 0) return;

        const ringRadius = ripple.maxRadius * ringProgress;
        const ringWidth = ripple.maxRadius * 0.08;

        // Create ring gradient (hollow center)
        const innerRadius = Math.max(0, ringRadius - ringWidth);
        const outerRadius = ringRadius + ringWidth;

        const gradient = ctx.createRadialGradient(
          ripple.x,
          ripple.y,
          innerRadius,
          ripple.x,
          ripple.y,
          outerRadius
        );

        const ringOpacity = ripple.opacity * ringOpacities[i] * (1 - ringProgress);

        gradient.addColorStop(
          0,
          `rgba(${color.r}, ${color.g}, ${color.b}, 0)`
        );
        gradient.addColorStop(
          0.3,
          `rgba(${color.r}, ${color.g}, ${color.b}, ${ringOpacity})`
        );
        gradient.addColorStop(
          0.5,
          `rgba(${color.r}, ${color.g}, ${color.b}, ${ringOpacity * 1.2})`
        );
        gradient.addColorStop(
          0.7,
          `rgba(${color.r}, ${color.g}, ${color.b}, ${ringOpacity})`
        );
        gradient.addColorStop(
          1,
          `rgba(${color.r}, ${color.g}, ${color.b}, 0)`
        );

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });
    },
    []
  );

  const drawHexGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      mouseX: number | null,
      mouseY: number | null,
      reducedMotion: boolean
    ) => {
      const gridState = updateGrid(width, height, mouseX, mouseY, reducedMotion);
      const { vertices, edges } = gridState;
      const { LINE_BASE_OPACITY, LINE_LIFT_OPACITY, MAX_DISPLACEMENT } = hexConfig;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      edges.forEach(([idx1, idx2]) => {
        const v1 = vertices[idx1];
        const v2 = vertices[idx2];

        // Skip edges entirely outside viewport
        if ((v1.x < -100 && v2.x < -100) ||
            (v1.x > width + 100 && v2.x > width + 100) ||
            (v1.y < -100 && v2.y < -100) ||
            (v1.y > height + 100 && v2.y > height + 100)) {
          return;
        }

        // Calculate opacity based on displacement
        const avgDisplacement = (v1.displacement + v2.displacement) / 2;
        const displacementRatio = avgDisplacement / MAX_DISPLACEMENT;
        const opacity = LINE_BASE_OPACITY + displacementRatio * (LINE_LIFT_OPACITY - LINE_BASE_OPACITY);

        // Choose color based on position for subtle variation
        const colorIndex = Math.abs(Math.floor((v1.baseX + v1.baseY) / 200)) % COLORS.length;
        const color = COLORS[colorIndex];

        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);

        // Line width increases slightly with displacement
        ctx.lineWidth = 0.5 + displacementRatio * 1;

        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
        ctx.stroke();
      });
    },
    [updateGrid, hexConfig]
  );

  const draw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      deltaTime: number
    ) => {
      // Clear with background color
      ctx.fillStyle = "#F0F0F0";
      ctx.fillRect(0, 0, width, height);

      const { x: mouseX, y: mouseY } = getMousePosition();
      const velocity = getVelocity();

      // Update and draw blobs
      // TEMPORARILY DISABLED
      // const blobs = updateBlobs(
      //   deltaTime,
      //   width,
      //   height,
      //   mouseX,
      //   mouseY,
      //   reducedMotionRef.current
      // );

      // blobs.forEach((blob) => {
      //   const color = COLORS[blob.colorIndex % COLORS.length];
      //   const gradient = ctx.createRadialGradient(
      //     blob.x,
      //     blob.y,
      //     0,
      //     blob.x,
      //     blob.y,
      //     blob.radius
      //   );

      //   gradient.addColorStop(
      //     0,
      //     `rgba(${color.r}, ${color.g}, ${color.b}, ${blob.opacity})`
      //   );
      //   gradient.addColorStop(
      //     0.5,
      //     `rgba(${color.r}, ${color.g}, ${color.b}, ${blob.opacity * 0.5})`
      //   );
      //   gradient.addColorStop(
      //     1,
      //     `rgba(${color.r}, ${color.g}, ${color.b}, 0)`
      //   );

      //   ctx.fillStyle = gradient;
      //   ctx.fillRect(0, 0, width, height);
      // });

      // Draw hexagonal grid with lift effect
      if (!reducedMotionRef.current) {
        drawHexGrid(ctx, width, height, mouseX, mouseY, reducedMotionRef.current);
      }

      // Draw trail ripples with multi-ring effect
      // TEMPORARILY DISABLED
      // const ripples = updateRipples(performance.now());
      // ripples.forEach((ripple) => {
      //   drawMultiRingRipple(ctx, ripple, width, height);
      // });

      // Draw cursor displacement glow
      if (mouseX !== null && mouseY !== null && !reducedMotionRef.current) {
        drawCursorGlow(ctx, mouseX, mouseY, velocity, width, height);
      }
    },
    [getMousePosition, getVelocity, updateBlobs, updateRipples, drawCursorGlow, drawMultiRingRipple, drawHexGrid]
  );

  const animate = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      const deltaTime = lastTimeRef.current ? time - lastTimeRef.current : 16;
      lastTimeRef.current = time;

      draw(ctx, width, height, deltaTime);

      animationRef.current = requestAnimationFrame(animate);
    },
    [draw]
  );

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    // Setup canvas
    const setup = setupCanvas();
    if (!setup) return;

    const { width, height } = setup;
    resetBlobs(width, height);
    resetGrid(width, height);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Handle resize
    const handleResize = () => {
      const newSetup = setupCanvas();
      if (newSetup) {
        resetBlobs(newSetup.width, newSetup.height);
        resetGrid(newSetup.width, newSetup.height);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, [setupCanvas, resetBlobs, resetGrid, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ touchAction: "none" }}
      aria-hidden="true"
    />
  );
}
