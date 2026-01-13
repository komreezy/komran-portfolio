"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LabProject } from "@/data/labProjects";

interface LabProjectCardProps {
  project: LabProject;
}

export default function LabProjectCard({ project }: LabProjectCardProps) {
  const isExternal = project.type === "external";
  const [imageError, setImageError] = useState(false);

  const cardContent = (
    <>
      {/* Thumbnail or Placeholder */}
      {project.thumbnail && !imageError ? (
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          className="object-cover transition-smooth group-hover:scale-105 group-hover:opacity-40"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center transition-smooth group-hover:opacity-40">
          <span className="text-xs uppercase tracking-wide text-[var(--background)]/40">
            {project.title}
          </span>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-smooth bg-[var(--foreground)]/60">
        {/* Title */}
        <h3 className="text-sm uppercase tracking-wide text-[var(--background)] mb-2">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[var(--background)]/80 mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-wide text-[var(--background)]/60 border border-[var(--background)]/30 px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Arrow indicator */}
        <span className="text-xs text-[var(--background)]">[→]</span>
      </div>
    </>
  );

  const className =
    "group relative aspect-[4/3] overflow-hidden bg-[var(--foreground)] block";

  if (isExternal) {
    return (
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link href={project.href} className={className}>
      {cardContent}
    </Link>
  );
}
