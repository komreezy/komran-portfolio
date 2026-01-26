"use client";

import Image from "next/image";
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
    name: "Dick's Sporting Goods",
    role: "Senior iOS Engineer",
    period: "Nov 2024 — Present",
    description: "Leading iOS feature planning, build management, and mentoring engineers across two teams.",
    tags: ["Swift", "CI/CD", "Team Lead"],
  },
  {
    id: 2,
    name: "Cloaked",
    role: "Senior iOS Engineer",
    period: "Mar 2023 — Nov 2024",
    description: "Built privacy-focused iOS app with SwiftUI, encryption, MFA, and deep linking.",
    tags: ["SwiftUI", "Combine", "Security"],
  },
  {
    id: 3,
    name: "Future",
    role: "Senior iOS Engineer",
    period: "Apr 2022 — Jan 2023",
    description: "Developed fitness app connecting users with trainers using UIKit and ML-powered features.",
    tags: ["UIKit", "Combine", "ML"],
  },
  {
    id: 4,
    name: "Peloton",
    role: "iOS Engineer",
    period: "Jan 2020 — Jan 2022",
    description: "Built Peloton Apple TV app from scratch with SwiftUI and revamped sharing functionality.",
    tags: ["SwiftUI", "tvOS", "Streaming"],
  },
  {
    id: 5,
    name: "WeWork",
    role: "iOS Engineer",
    period: "Aug 2017 — Dec 2019",
    description: "Developed FieldLens construction planning tool with 360° camera integration.",
    tags: ["UIKit", "MVVM", "GraphQL"],
  },
];

const projects = [
  {
    id: 1,
    name: "Julienne",
    period: "2023",
    description: "AI-powered kitchen assistant that converts social media videos into recipes with a cooking companion experience.",
    tags: ["AI", "iOS", "SwiftUI"],
  },
  {
    id: 2,
    name: "Savvy",
    period: "2019",
    description: "App that monitors building carbon emissions using hardware sensors.",
    tags: ["SwiftUI", "Combine", "GraphQL"],
  },
  {
    id: 3,
    name: "Featured",
    period: "2018",
    description: "Instagram story layout editor with templates, image search, visual effects, and text tools.",
    tags: ["iOS", "UIKit", "Media"],
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
          {/* Profile photo */}
          <div className="relative aspect-square w-[200px] overflow-hidden">
            <Image
              src="/profile.png"
              alt="Komran Ghahremani"
              fill
              className="object-cover"
              priority
            />
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

        {/* Projects Section */}
        <div className="mb-20">
          <h2 className="text-xs uppercase tracking-wide mb-8 text-center">Projects</h2>
          <Timeline items={projects} />
        </div>

        {/* Experience Section */}
        <div className="mb-20">
          <h2 className="text-xs uppercase tracking-wide mb-8 text-center">Experience</h2>
          <Timeline items={companies} showRole />
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
