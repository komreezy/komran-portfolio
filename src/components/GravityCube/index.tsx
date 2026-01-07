"use client";

import dynamic from "next/dynamic";

const GravityCubeCanvas = dynamic(
  () => import("./GravityCube").then((mod) => mod.default),
  { ssr: false }
);

export default function GravityCube() {
  return <GravityCubeCanvas />;
}
