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
    <main className="min-h-screen">
      {/* Marquee */}
      <Marquee />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-8 pt-24">
        <p className="text-xs uppercase tracking-wide text-center max-w-md leading-relaxed">
          Komran is a brand and digital design lead who turns complex ideas into
          clear, emotional brands through strategy, storytelling, and
          experimentation.
        </p>
      </section>

      {/* Project List */}
      <section className="px-8 pb-24">
        <ul className="flex flex-col">
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

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 px-8 py-6 flex items-center justify-between bg-[var(--background)]">
        <span className="text-xs uppercase tracking-wide">
          Based in Your City
        </span>
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="1" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="1" />
          </svg>
          <span className="text-xs uppercase tracking-wide">
            Working Worldwide
          </span>
        </div>
      </footer>
    </main>
  );
}
