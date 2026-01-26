"use client";

import { useRef, useCallback } from "react";

interface HexVertex {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  displacement: number;
}

interface HexGridState {
  vertices: HexVertex[];
  edges: [number, number][];
  width: number;
  height: number;
}

// Configuration
const HEX_SIZE = 70;
const EFFECT_RADIUS = 250;
const MAX_DISPLACEMENT = 40;
const LINE_BASE_OPACITY = 0.20;
const LINE_LIFT_OPACITY = 0.45;
const LERP_SPEED = 0.08;

export function useHexGrid() {
  const stateRef = useRef<HexGridState | null>(null);

  const initGrid = useCallback((width: number, height: number): HexGridState => {
    const vertices: HexVertex[] = [];
    const vertexMap = new Map<string, number>(); // Key: "x,y" -> vertex index
    const edges: [number, number][] = [];

    // Hexagon dimensions (pointy-top orientation)
    const horizSpacing = HEX_SIZE * Math.sqrt(3);
    const vertSpacing = HEX_SIZE * 1.5;

    // Calculate grid dimensions with padding
    const padding = HEX_SIZE * 2;
    const cols = Math.ceil((width + padding * 2) / horizSpacing) + 1;
    const rows = Math.ceil((height + padding * 2) / vertSpacing) + 1;

    // Helper to get or create vertex
    const getVertexIndex = (x: number, y: number): number => {
      // Round to avoid floating point issues
      const key = `${Math.round(x * 100)},${Math.round(y * 100)}`;
      if (vertexMap.has(key)) {
        return vertexMap.get(key)!;
      }
      const index = vertices.length;
      vertices.push({
        baseX: x,
        baseY: y,
        x: x,
        y: y,
        displacement: 0,
      });
      vertexMap.set(key, index);
      return index;
    };

    // Generate hexagons
    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        // Center of this hexagon
        const centerX = col * horizSpacing + (row % 2 === 1 ? horizSpacing / 2 : 0) - padding;
        const centerY = row * vertSpacing - padding;

        // Six corners of a pointy-top hexagon
        const corners: [number, number][] = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6; // Start at top-right
          const cornerX = centerX + HEX_SIZE * Math.cos(angle);
          const cornerY = centerY + HEX_SIZE * Math.sin(angle);
          corners.push([cornerX, cornerY]);
        }

        // Get vertex indices for all corners
        const cornerIndices = corners.map(([x, y]) => getVertexIndex(x, y));

        // Create edges between adjacent corners
        for (let i = 0; i < 6; i++) {
          const nextI = (i + 1) % 6;
          const idx1 = cornerIndices[i];
          const idx2 = cornerIndices[nextI];

          // Avoid duplicate edges (only add if idx1 < idx2)
          if (idx1 < idx2) {
            edges.push([idx1, idx2]);
          }
        }
      }
    }

    return { vertices, edges, width, height };
  }, []);

  const getState = useCallback(
    (width: number, height: number): HexGridState => {
      if (!stateRef.current ||
          stateRef.current.width !== width ||
          stateRef.current.height !== height) {
        stateRef.current = initGrid(width, height);
      }
      return stateRef.current;
    },
    [initGrid]
  );

  const updateGrid = useCallback(
    (
      width: number,
      height: number,
      mouseX: number | null,
      mouseY: number | null,
      reducedMotion: boolean
    ): HexGridState => {
      const state = getState(width, height);

      state.vertices.forEach((vertex) => {
        let targetX = vertex.baseX;
        let targetY = vertex.baseY;
        let targetDisplacement = 0;

        if (mouseX !== null && mouseY !== null && !reducedMotion) {
          const dx = vertex.baseX - mouseX;
          const dy = vertex.baseY - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < EFFECT_RADIUS && distance > 0) {
            // Smooth quadratic falloff
            const strength = Math.pow(1 - distance / EFFECT_RADIUS, 2);
            const displacement = MAX_DISPLACEMENT * strength;

            // Push outward from cursor
            const normalX = dx / distance;
            const normalY = dy / distance;
            targetX = vertex.baseX + normalX * displacement;
            targetY = vertex.baseY + normalY * displacement;
            targetDisplacement = displacement;
          }
        }

        // Smooth interpolation
        const speed = reducedMotion ? LERP_SPEED * 0.5 : LERP_SPEED;
        vertex.x += (targetX - vertex.x) * speed;
        vertex.y += (targetY - vertex.y) * speed;
        vertex.displacement += (targetDisplacement - vertex.displacement) * speed;
      });

      return state;
    },
    [getState]
  );

  const resetGrid = useCallback((width: number, height: number) => {
    stateRef.current = initGrid(width, height);
  }, [initGrid]);

  return {
    updateGrid,
    resetGrid,
    config: {
      LINE_BASE_OPACITY,
      LINE_LIFT_OPACITY,
      MAX_DISPLACEMENT,
    }
  };
}
