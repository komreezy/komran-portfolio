import Header from "@/components/Header";
import Marquee from "@/components/Marquee";
import Avatar3D from "@/components/Avatar3D";
import Link from "next/link";

export default function AvatarGame() {
  return (
    <main className="min-h-screen">
      {/* Marquee */}
      <Marquee />

      {/* Header */}
      <Header />

      {/* Content */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 pt-24">
        {/* Back link */}
        <Link
          href="/lab"
          className="text-xs uppercase tracking-wide mb-8 hover:opacity-60 transition-smooth"
        >
          [←] Back to Lab
        </Link>

        <Avatar3D />

        <p className="text-xs uppercase tracking-wide text-center mt-4">
          Interactive 3D Avatar
        </p>

        {/* Controls hint */}
        <p className="text-[10px] uppercase tracking-wide text-center mt-2 text-[var(--foreground)]/60">
          Click to focus, then use WASD to move
        </p>
      </section>
    </main>
  );
}
