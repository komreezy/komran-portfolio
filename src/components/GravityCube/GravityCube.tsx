"use client";

import { Canvas } from "@react-three/fiber";
import { useControls, Leva } from "leva";
import { Cube, AnimationType } from "./Cube";

export default function GravityCube() {
  const { animation, color, speed, range, size, showControls } =
    useControls({
      showControls: { value: true, label: "Show Panel" },
      animation: {
        value: "drift" as AnimationType,
        options: ["tilt", "drift", "orbit", "tumble"] as AnimationType[],
        label: "Animation",
      },
      color: { value: "#1a472a", label: "Color" },
      speed: { value: 0.1, min: 0.1, max: 3, step: 0.1, label: "Speed" },
      range: { value: 1, min: 0.1, max: 2, step: 0.1, label: "Range" },
      size: { value: 1.5, min: 0.5, max: 3, step: 0.1, label: "Size" },
    });

  return (
    <>
      <Leva hidden={!showControls} collapsed={false} />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
        >
          <Cube
            animation={animation}
            color={color}
            speed={speed}
            range={range}
            size={size}
          />
        </Canvas>
      </div>
    </>
  );
}
