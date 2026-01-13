export interface LabProject {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  href: string;
  type: "internal" | "external" | "inline";
  tags?: string[];
}

export const labProjects: LabProject[] = [
  {
    id: "avatar",
    title: "3D Avatar Game",
    description:
      "Interactive 3D character with WASD controls, animations, and physics.",
    thumbnail: "/lab/avatar-thumb.png",
    href: "/lab/avatar",
    type: "internal",
    tags: ["Three.js", "React Three Fiber"],
  },
  {
    id: "julienne",
    title: "Julienne",
    description: "Recipe and meal planning application.",
    thumbnail: "/lab/julienne-thumb.png",
    href: "#",
    type: "external",
    tags: ["Web App", "Design"],
  },
  {
    id: "savvy",
    title: "Savvy",
    description: "Financial tracking and insights tool.",
    thumbnail: "/lab/savvy-thumb.png",
    href: "#",
    type: "external",
    tags: ["Fintech", "Dashboard"],
  },
  {
    id: "featured",
    title: "Featured",
    description: "Curated collection of experimental work.",
    thumbnail: "/lab/featured-thumb.png",
    href: "#",
    type: "internal",
    tags: ["Experiments"],
  },
];
