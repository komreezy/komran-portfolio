"use client";

import { useRef, useCallback } from "react";

interface Blob {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  opacity: number;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
  amplitudeX: number;
  amplitudeY: number;
  colorIndex: number;
}

interface AnimationState {
  blobs: Blob[];
  time: number;
  globalPhase: number;
}

export function useGradientAnimation() {
  const stateRef = useRef<AnimationState | null>(null);

  const initBlobs = useCallback((width: number, height: number): Blob[] => {
    return [
      {
        x: width * 0.3,
        y: height * 0.3,
        baseX: width * 1.3,
        baseY: height * 1.3,
        radius: Math.max(width, height) * 0.4,
        opacity: 0.4,
        phaseX: 0,
        phaseY: Math.PI / 3,
        speedX: 0.00008, // Very slow individual movement
        speedY: 0.0001,
        amplitudeX: width * 0.2,
        amplitudeY: height * 0.18,
        colorIndex: 0, // Purple
      },
      {
        x: width * 0.7,
        y: height * 0.6,
        baseX: width * 0.7,
        baseY: height * 0.6,
        radius: Math.max(width, height) * 0.35,
        opacity: 0.45,
        phaseX: Math.PI / 2,
        phaseY: Math.PI,
        speedX: 0.00009,
        speedY: 0.00007,
        amplitudeX: width * 0.18,
        amplitudeY: height * 0.2,
        colorIndex: 1, // Blue
      },
      {
        x: width * 0.5,
        y: height * 0.8,
        baseX: width * 0.5,
        baseY: height * 0.8,
        radius: Math.max(width, height) * 0.3,
        opacity: 0.35,
        phaseX: Math.PI,
        phaseY: Math.PI / 4,
        speedX: 0.00006,
        speedY: 0.00008,
        amplitudeX: width * 0.15,
        amplitudeY: height * 0.15,
        colorIndex: 2, // Pink
      },
    ];
  }, []);

  const getState = useCallback(
    (width: number, height: number): AnimationState => {
      if (!stateRef.current) {
        stateRef.current = {
          blobs: initBlobs(width, height),
          time: 0,
          globalPhase: 0,
        };
      }
      return stateRef.current;
    },
    [initBlobs]
  );

  const updateBlobs = useCallback(
    (
      deltaTime: number,
      width: number,
      height: number,
      mouseX: number | null,
      mouseY: number | null,
      reducedMotion: boolean
    ) => {
      const state = getState(width, height);
      state.time += deltaTime;
      state.globalPhase += deltaTime * 0.0003; // Visible flow speed

      // Multiple wave frequencies for organic, wavy movement
      const wave1X = Math.sin(state.globalPhase) * width * 0.08;
      const wave1Y = Math.cos(state.globalPhase * 0.7) * height * 0.06;
      const wave2X = Math.sin(state.globalPhase * 1.5 + Math.PI / 4) * width * 0.04;
      const wave2Y = Math.cos(state.globalPhase * 1.3) * height * 0.03;

      const globalOffsetX = wave1X + wave2X;
      const globalOffsetY = wave1Y + wave2Y;

      // Breathing scale factor (noticeable expansion/contraction)
      const breathingScale = 1 + Math.sin(state.globalPhase * 0.8) * 0.12;

      state.blobs.forEach((blob, index) => {
        // Update phases for Lissajous curves
        blob.phaseX += blob.speedX * deltaTime;
        blob.phaseY += blob.speedY * deltaTime;

        // Calculate autonomous position with global flow offset
        // Each blob gets a phase-shifted global offset for organic flowing feel
        const phaseOffset = index * (Math.PI / 2.5);
        const blobGlobalX = globalOffsetX * (0.7 + 0.3 * Math.cos(state.globalPhase + phaseOffset));
        const blobGlobalY = globalOffsetY * (0.7 + 0.3 * Math.sin(state.globalPhase * 0.8 + phaseOffset));

        let targetX = blob.baseX + Math.sin(blob.phaseX) * blob.amplitudeX + blobGlobalX;
        let targetY = blob.baseY + Math.cos(blob.phaseY) * blob.amplitudeY + blobGlobalY;

        // Apply breathing scale to radius (subtle)
        blob.radius = Math.max(width, height) * (0.3 + index * 0.05) * breathingScale;

        // Tablecloth effect: push blobs outward from cursor (creates "lift" effect)
        const baseOpacity = [0.4, 0.45, 0.35][index];
        blob.opacity = baseOpacity; // Reset to base

        if (mouseX !== null && mouseY !== null && !reducedMotion) {
          const dx = targetX - mouseX; // Reversed: blob position minus mouse = outward direction
          const dy = targetY - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const effectRadius = Math.max(width, height) * 0.4;

          if (distance < effectRadius && distance > 0) {
            // Smooth quadratic falloff from center
            const strength = Math.pow(1 - distance / effectRadius, 2);
            const displacement = 80 * strength; // Push outward
            const normalX = dx / distance;
            const normalY = dy / distance;

            targetX += normalX * displacement;
            targetY += normalY * displacement;

            // Increase opacity near cursor for "lift" visual
            blob.opacity = baseOpacity + strength * 0.15;
          }
        }

        // Smoother interpolation to target (reduced from 0.03 to 0.015)
        const smoothing = reducedMotion ? 0.01 : 0.015;
        blob.x += (targetX - blob.x) * smoothing;
        blob.y += (targetY - blob.y) * smoothing;
      });

      return state.blobs;
    },
    [getState]
  );

  const resetBlobs = useCallback((width: number, height: number) => {
    stateRef.current = {
      blobs: initBlobs(width, height),
      time: 0,
      globalPhase: 0,
    };
  }, [initBlobs]);

  return { updateBlobs, getState, resetBlobs };
}
