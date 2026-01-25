"use client";

import dynamic from "next/dynamic";

const SmashBros = dynamic(() => import("./SmashBros"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="text-white font-mono">Loading game...</div>
    </div>
  ),
});

export default SmashBros;
