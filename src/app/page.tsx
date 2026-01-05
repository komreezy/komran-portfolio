import Header from "@/components/Header";
import Marquee from "@/components/Marquee";
import Link from "next/link";

const projects = [
  { title: "Project Alpha", href: "#" },
  { title: "Project Beta", href: "#" },
  { title: "Project Gamma", href: "#" },
  { title: "Project Delta", href: "#" },
  { title: "Project Omega", href: "#" },
];

export default function Home() {
  return (
    <main className="h-screen overflow-hidden flex flex-col">
      {/* Marquee */}
      <Marquee />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-8">
        <p className="text-xs uppercase tracking-wide text-center leading-relaxed max-w-sm mx-auto">
          Komran is a brand and digital design lead who turns complex ideas into
          clear, emotional brands through strategy, storytelling, and
          experimentation.
        </p>
      </section>

      {/* Project List - Fixed to bottom */}
      <section className="px-8 pb-6 bg-[var(--background)]">
        <ul className="flex flex-col max-w-sm mx-auto">
          {projects.map((project) => (
            <li
              key={project.title}
              className="border-t border-[var(--border)] py-4 flex items-center justify-between group"
            >
              <Link
                href={project.href}
                className="text-xs uppercase tracking-wide hover:opacity-60 transition-smooth"
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
