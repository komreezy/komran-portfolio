import Link from "next/link";

interface BlogPostCardProps {
  post: {
    slug: string;
    title: string;
    description?: string | null;
    tags?: string[] | null;
    created_at: string;
  };
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="py-6 border-b border-[var(--foreground)]/10 transition-smooth group-hover:pl-4">
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <h2 className="text-sm font-medium group-hover:underline underline-offset-2">
            {post.title}
          </h2>
          <time className="text-xs uppercase tracking-wide text-[var(--foreground)]/50 shrink-0">
            {formattedDate}
          </time>
        </div>
        {post.description && (
          <p className="text-xs text-[var(--foreground)]/60 leading-relaxed">
            {post.description}
          </p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-2 mt-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs uppercase tracking-wide px-2 py-0.5 bg-[var(--foreground)]/5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
