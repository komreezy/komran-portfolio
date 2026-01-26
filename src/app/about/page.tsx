"use client";

import Header from "@/components/Header";
import Marquee from "@/components/Marquee";

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "GitHub", href: "https://github.com" },
];

const companies = [
  {
    id: 1,
    name: "Company A",
    role: "Senior Software Engineer",
    period: "2022 — Present",
    description: "Building scalable web applications and leading technical initiatives.",
    tags: ["React", "TypeScript", "Node.js"],
  },
  {
    id: 2,
    name: "Company B",
    role: "Software Engineer",
    period: "2020 — 2022",
    description: "Developed full-stack features and improved system performance.",
    tags: ["Python", "AWS", "PostgreSQL"],
  },
  {
    id: 3,
    name: "Company C",
    role: "Junior Developer",
    period: "2018 — 2020",
    description: "Started my journey building web applications and learning best practices.",
    tags: ["JavaScript", "React", "CSS"],
  },
];

const projects = [
  {
    id: 1,
    name: "Project Alpha",
    period: "2023",
    description: "A productivity tool that helps teams collaborate more effectively.",
    tags: ["Next.js", "Supabase"],
    link: "https://example.com",
  },
  {
    id: 2,
    name: "Project Beta",
    period: "2022",
    description: "An open-source library for building accessible UI components.",
    tags: ["TypeScript", "React"],
    link: "https://github.com",
  },
  {
    id: 3,
    name: "Project Gamma",
    period: "2021",
    description: "A mobile app for tracking personal goals and habits.",
    tags: ["React Native", "Firebase"],
  },
];

interface TimelineItem {
  id: number;
  name: string;
  period: string;
  description: string;
  tags?: string[];
  role?: string;
  link?: string;
}

function Timeline({ items, showRole = false }: { items: TimelineItem[]; showRole?: boolean }) {
  return (
    <div className="relative">
      {/* Center line - hidden on mobile */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--foreground)]/10 hidden md:block" />

      {items.map((item, index) => (
        <div
          key={item.id}
          className={`relative flex mb-8 last:mb-0 ${
            index % 2 === 0 ? "md:justify-start" : "md:justify-end"
          }`}
        >
          {/* Timeline dot - hidden on mobile */}
          <div className="absolute left-1/2 -translate-x-1/2 top-4 w-2 h-2 bg-[var(--accent)] hidden md:block" />

          {/* Card */}
          <div className="w-full md:w-5/12 p-4 border border-[var(--foreground)]/20 hover:bg-[var(--foreground)]/5 transition-smooth">
            <span className="text-xs uppercase tracking-wide text-[var(--foreground)]/50">
              {item.period}
            </span>
            <h3 className="text-sm mt-1">{item.name}</h3>
            {showRole && item.role && (
              <p className="text-xs text-[var(--foreground)]/60 mt-0.5">{item.role}</p>
            )}
            <p className="text-xs text-[var(--foreground)]/60 mt-2 leading-relaxed">
              {item.description}
            </p>
            {item.tags && (
              <div className="flex flex-wrap gap-2 mt-3">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] uppercase tracking-wide px-2 py-1 border border-[var(--foreground)]/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-xs uppercase tracking-wide text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-smooth"
              >
                View Project →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Marquee />
      <Header />

      <section className="max-w-3xl mx-auto px-8 pt-32 pb-16">
        {/* Photo + Bio Section */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12 mb-20">
          {/* Placeholder photo */}
          <div className="relative aspect-square w-[200px] bg-[var(--foreground)] flex items-center justify-center">
            <span className="text-2xl text-[var(--background)] font-light">KG</span>
          </div>

          {/* Bio text */}
          <div>
            <h1 className="text-xs uppercase tracking-wide mb-4">About</h1>
            <p className="text-sm leading-relaxed text-[var(--foreground)]/80 mb-4">
              I&apos;m a software engineer passionate about building products that make a difference.
              With experience across the full stack, I enjoy tackling complex problems and creating
              elegant solutions.
            </p>
            <p className="text-sm leading-relaxed text-[var(--foreground)]/80">
              When I&apos;m not coding, you can find me exploring new technologies, contributing to
              open-source projects, or sharing knowledge with the developer community.
            </p>
          </div>
        </div>

        {/* Experience Section */}
        <div className="mb-20">
          <h2 className="text-xs uppercase tracking-wide mb-8 text-center">Experience</h2>
          <Timeline items={companies} showRole />
        </div>

        {/* Projects Section */}
        <div className="mb-20">
          <h2 className="text-xs uppercase tracking-wide mb-8 text-center">Projects</h2>
          <Timeline items={projects} />
        </div>

        {/* Connect Section (reused from Contact) */}
        <div className="border-t border-[var(--foreground)]/10 pt-8 space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-wide mb-4">Connect</h2>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-wide px-3 py-2 border border-[var(--foreground)]/20 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-smooth"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-wide mb-4">Resume</h2>
            <a
              href="/cv.pdf"
              download
              className="inline-block text-xs uppercase tracking-wide px-4 py-3 border border-[var(--foreground)]/20 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-smooth"
            >
              Download CV
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
