import Header from "@/components/Header";
import Marquee from "@/components/Marquee";

export default function Play() {
  return (
    <main className="min-h-screen">
      {/* Marquee */}
      <Marquee />

      {/* Header */}
      <Header />

      {/* Content */}
      <section className="min-h-screen flex items-center justify-center px-8 pt-24">
        <p className="text-xs uppercase tracking-wide text-center">
          Play — Coming Soon
        </p>
      </section>
    </main>
  );
}
