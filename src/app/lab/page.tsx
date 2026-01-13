import Header from "@/components/Header";
import Marquee from "@/components/Marquee";
import LabProjectCard from "@/components/LabProjectCard";
import { labProjects } from "@/data/labProjects";

export default function Lab() {
  return (
    <main className="min-h-screen">
      {/* Marquee */}
      <Marquee />

      {/* Header */}
      <Header />

      {/* Content */}
      <section className="px-8 pt-32 pb-16">
        {/* Page Title */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-xs uppercase tracking-wide mb-2">Lab</h1>
          <p className="text-xs uppercase tracking-wide text-[var(--foreground)]/60">
            Experiments, prototypes, and side projects
          </p>
        </div>

        {/* Project Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {labProjects.map((project) => (
            <LabProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </main>
  );
}
