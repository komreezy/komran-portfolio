import Header from "@/components/Header";
import Marquee from "@/components/Marquee";
import Link from "next/link";
import GradientBackground from "@/components/GradientBackground";

const projects = [
  { title: "Julienne", href: "#" },
  { title: "Savvy", href: "#" },
  { title: "Featured", href: "#" },
  { title: "Some new stuff I'm trying...", href: "/lab" },
];

export default function Home() {
  return (
    <main className="h-screen overflow-hidden flex flex-col">
      {/* Gradient Background */}
      <GradientBackground />

      {/* Marquee */}
      <Marquee />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-8">
        <p className="text-xs uppercase tracking-wide text-center leading-relaxed max-w-sm mx-auto">
        Howdy, I'm komran. Redoing my site as a playground. I'm using this space for you to get to know me, see what I'm tinkering with, and get in touch!
        </p>
      </section>

      {/* Project List - Fixed to bottom */}
      <section className="px-8 pb-6">
        <ul className="flex flex-col max-w-sm mx-auto">
          {projects.map((project) => (
            <li
              key={project.title}
              className="border-t border-[var(--border)] py-4 px-2 flex items-center justify-between group hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-smooth"
            >
              <Link
                href={project.href}
                className="text-xs uppercase tracking-wide transition-smooth"
              >
                {project.title}
              </Link>
              <Link
                href={project.href}
                className="text-xs opacity-0 group-hover:opacity-100 transition-smooth"
              >
                [→]
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
