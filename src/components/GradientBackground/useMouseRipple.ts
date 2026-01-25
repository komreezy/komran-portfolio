"use client";

import { useRef, useCallback, useEffect } from "react";

interface MouseState {
  x: number | null;
  y: number | null;
  lastUpdate: number;
}

interface TrailRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  startTime: number;
  colorIndex: number;
}

const THROTTLE_MS = 16; // ~60fps
const RIPPLE_DURATION = 1500; // Slower ripples for calmer feel (was 800)
const TRAIL_SPAWN_DISTANCE = 80; // Less frequent ripples (was 50)
const MIN_RIPPLE_RADIUS = 80;
const MAX_RIPPLE_RADIUS = 250;
const BASE_OPACITY = 0.08;

export function useMouseRipple(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const mouseRef = useRef<MouseState>({ x: null, y: null, lastUpdate: 0 });
  const prevMouseRef = useRef<{ x: number; y: number } | null>(null);
  const velocityRef = useRef<number>(0);
  const distanceTraveledRef = useRef<number>(0);
  const ripplesRef = useRef<TrailRipple[]>([]);
  const colorIndexRef = useRef<number>(0);

  const spawnRipple = useCallback((x: number, y: number, velocity: number) => {
    // Scale radius based on velocity (faster = larger ripples)
    const velocityFactor = Math.min(velocity / 20, 1); // Normalize velocity
    const maxRadius = MIN_RIPPLE_RADIUS + (MAX_RIPPLE_RADIUS - MIN_RIPPLE_RADIUS) * velocityFactor;

    ripplesRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius,
      opacity: BASE_OPACITY,
      startTime: performance.now(),
      colorIndex: colorIndexRef.current,
    });

    // Cycle through colors
    colorIndexRef.current = (colorIndexRef.current + 1) % 5;

    // Limit number of ripples for performance
    if (ripplesRef.current.length > 15) {
      ripplesRef.current.shift();
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = performance.now();
    if (now - mouseRef.current.lastUpdate < THROTTLE_MS) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // Calculate velocity and distance
    if (prevMouseRef.current) {
      const dx = currentX - prevMouseRef.current.x;
      const dy = currentY - prevMouseRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Update velocity (smoothed)
      velocityRef.current = velocityRef.current * 0.7 + distance * 0.3;

      // Accumulate distance traveled
      distanceTraveledRef.current += distance;

      // Spawn ripple when enough distance traveled
      if (distanceTraveledRef.current >= TRAIL_SPAWN_DISTANCE && velocityRef.current > 2) {
        spawnRipple(currentX, currentY, velocityRef.current);
        distanceTraveledRef.current = 0;
      }
    }

    prevMouseRef.current = { x: currentX, y: currentY };
    mouseRef.current = {
      x: currentX,
      y: currentY,
      lastUpdate: now,
    };
  }, [canvasRef, spawnRipple]);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: null, y: null, lastUpdate: 0 };
    prevMouseRef.current = null;
    velocityRef.current = 0;
    distanceTraveledRef.current = 0;
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spawn a larger ripple on click
    ripplesRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: MAX_RIPPLE_RADIUS * 1.5,
      opacity: BASE_OPACITY * 1.5,
      startTime: performance.now(),
      colorIndex: colorIndexRef.current,
    });

    // Cycle through colors
    colorIndexRef.current = (colorIndexRef.current + 1) % 5;
  }, [canvasRef]);

  useEffect(() => {
    // Use window events instead of canvas events since canvas is behind other elements (-z-10)
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
    };
  }, [handleMouseMove, handleMouseLeave, handleClick]);

  const getMousePosition = useCallback(() => {
    return { x: mouseRef.current.x, y: mouseRef.current.y };
  }, []);

  const getVelocity = useCallback(() => {
    return velocityRef.current;
  }, []);

  const updateRipples = useCallback((now: number) => {
    ripplesRef.current = ripplesRef.current.filter((ripple) => {
      const elapsed = now - ripple.startTime;
      if (elapsed > RIPPLE_DURATION) return false;

      const progress = elapsed / RIPPLE_DURATION;
      ripple.radius = ripple.maxRadius * easeOutQuart(progress);
      ripple.opacity = BASE_OPACITY * (1 - easeOutQuart(progress)); // Smoother fade
      return true;
    });

    return ripplesRef.current;
  }, []);

  return { getMousePosition, getVelocity, updateRipples };
}

// Smoother easing function for slower, more elegant ripples
function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}
