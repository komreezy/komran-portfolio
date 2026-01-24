import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import Header from "@/components/Header";
import Marquee from "@/components/Marquee";
import { MDXComponents } from "@/components/MDXComponents";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { data: posts } = await supabase
    .from("posts")
    .select("slug")
    .eq("published", true);

  return posts?.map((post) => ({ slug: post.slug })) || [];
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen">
      <Marquee />
      <Header />

      <article className="max-w-2xl mx-auto px-8 pt-32 pb-16">
        <Link
          href="/blog"
          className="text-xs uppercase tracking-wide text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-smooth mb-8 inline-block"
        >
          &larr; Back to blog
        </Link>

        <header className="mb-12">
          <h1 className="text-2xl font-medium mb-3">{post.title}</h1>
          <time className="text-xs uppercase tracking-wide text-[var(--foreground)]/50">
            {formattedDate}
          </time>
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 mt-4">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs uppercase tracking-wide px-2 py-0.5 bg-[var(--foreground)]/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose-custom">
          <MDXRemote source={post.content} components={MDXComponents} />
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--foreground)]/10">
          <Link
            href="/blog"
            className="text-xs uppercase tracking-wide hover:underline underline-offset-2 transition-smooth"
          >
            &larr; Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
