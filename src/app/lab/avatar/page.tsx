"use client";

import { useRouter } from "next/navigation";
import SmashBros from "@/components/SmashBros";

export default function SmashBrosPage() {
  const router = useRouter();

  return (
    <SmashBros onClose={() => router.push("/lab")} />
  );
}
