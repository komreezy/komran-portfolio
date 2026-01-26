import Header from "@/components/Header";
import Marquee from "@/components/Marquee";
import GradientBackground from "@/components/GradientBackground";

export default function Home() {
  return (
    <main className="h-screen overflow-hidden flex flex-col">
      {/* Gradient Background */}
      <GradientBackground />

      {/* Marquee */}
      <Marquee />

      {/* Header */}
      <Header />

      {/* Hero Section - Centered */}
      <section className="flex-1 flex items-center justify-center px-8 pb-32">
        <p className="text-xs uppercase tracking-wide text-center leading-relaxed max-w-sm mx-auto">
        Howdy, I'm komran. Redoing my site as a playground. I'm using this space for you to get to know me, see what I'm tinkering with, and get in touch!
        </p>
      </section>
    </main>
  );
}
