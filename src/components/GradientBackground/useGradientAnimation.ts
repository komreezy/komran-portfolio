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
        baseX: width * 0.3,
        baseY: height * 0.3,
        radius: Math.max(width, height) * 0.4,
        opacity: 0.15,
        phaseX: 0,
        phaseY: Math.PI / 3,
        speedX: 0.00015, // Slowed from 0.0003
        speedY: 0.0002,  // Slowed from 0.0004
        amplitudeX: width * 0.15,
        amplitudeY: height * 0.12,
        colorIndex: 0, // Purple
      },
      {
        x: width * 0.7,
        y: height * 0.6,
        baseX: width * 0.7,
        baseY: height * 0.6,
        radius: Math.max(width, height) * 0.35,
        opacity: 0.18,
        phaseX: Math.PI / 2,
        phaseY: Math.PI,
        speedX: 0.000175, // Slowed from 0.00035
        speedY: 0.000125, // Slowed from 0.00025
        amplitudeX: width * 0.12,
        amplitudeY: height * 0.15,
        colorIndex: 1, // Blue
      },
      {
        x: width * 0.5,
        y: height * 0.8,
        baseX: width * 0.5,
        baseY: height * 0.8,
        radius: Math.max(width, height) * 0.3,
        opacity: 0.12,
        phaseX: Math.PI,
        phaseY: Math.PI / 4,
        speedX: 0.000125, // Slowed from 0.00025
        speedY: 0.000175, // Slowed from 0.00035
        amplitudeX: width * 0.1,
        amplitudeY: height * 0.1,
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
      state.globalPhase += deltaTime * 0.00008; // Slow global phase for flowing effect

      // Calculate global flow offsets - creates a unified "breathing" movement
      const globalOffsetX = Math.sin(state.globalPhase) * width * 0.02;
      const globalOffsetY = Math.cos(state.globalPhase * 0.75) * height * 0.015;

      // Breathing scale factor (subtle expansion/contraction)
      const breathingScale = 1 + Math.sin(state.globalPhase * 1.2) * 0.03;

      state.blobs.forEach((blob, index) => {
        // Update phases for Lissajous curves
        blob.phaseX += blob.speedX * deltaTime;
        blob.phaseY += blob.speedY * deltaTime;

        // Calculate autonomous position with global flow offset
        // Each blob gets a slightly phase-shifted global offset for organic feel
        const phaseOffset = index * (Math.PI / 3);
        const blobGlobalX = globalOffsetX * Math.cos(state.globalPhase + phaseOffset);
        const blobGlobalY = globalOffsetY * Math.sin(state.globalPhase + phaseOffset);

        let targetX = blob.baseX + Math.sin(blob.phaseX) * blob.amplitudeX + blobGlobalX;
        let targetY = blob.baseY + Math.cos(blob.phaseY) * blob.amplitudeY + blobGlobalY;

        // Apply breathing scale to radius (subtle)
        blob.radius = Math.max(width, height) * (0.3 + index * 0.05) * breathingScale;

        // Mouse attraction (gentler - reduced from 0.08 to 0.04)
        if (mouseX !== null && mouseY !== null && !reducedMotion) {
          const dx = mouseX - targetX;
          const dy = mouseY - targetY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = Math.max(width, height) * 0.5;

          if (distance < maxDistance) {
            const attraction = 0.04 * (1 - distance / maxDistance); // Reduced from 0.08
            targetX += dx * attraction;
            targetY += dy * attraction;
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
