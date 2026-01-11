import Header from "@/components/Header";
import Marquee from "@/components/Marquee";
import Avatar3D from "@/components/Avatar3D";

export default function Play() {
  return (
    <main className="min-h-screen">
      {/* Marquee */}
      <Marquee />

      {/* Header */}
      <Header />

      {/* Content */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 pt-24">
        <Avatar3D />
        <p className="text-xs uppercase tracking-wide text-center mt-4">
          Interactive 3D Avatar
        </p>
      </section>
    </main>
  );
}
