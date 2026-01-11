"use client";

import dynamic from "next/dynamic";

const Avatar3DCanvas = dynamic(() => import("./Avatar3D"), { ssr: false });

export default function Avatar3D() {
  return <Avatar3DCanvas />;
}
