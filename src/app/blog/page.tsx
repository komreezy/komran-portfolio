import Header from "@/components/Header";
import Marquee from "@/components/Marquee";
import BlogPostCard from "@/components/BlogPostCard";
import { getAllPosts } from "@/lib/mdx";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen">
      <Marquee />
      <Header />

      <section className="max-w-2xl mx-auto px-8 pt-32 pb-16">
        <div className="mb-12">
          <h1 className="text-xs uppercase tracking-wide mb-2">Blog</h1>
          <p className="text-xs text-[var(--foreground)]/50">
            Thoughts and learnings
          </p>
        </div>

        {posts.length > 0 ? (
          <div>
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--foreground)]/50">
            No posts yet. Check back soon.
          </p>
        )}
      </section>
    </main>
  );
}
