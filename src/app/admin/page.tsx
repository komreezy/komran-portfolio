"use client";

import { useState, useEffect } from "react";
import { Post } from "@/types/supabase";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    tags: "",
    published: false,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminToken(password);
    setIsAuthenticated(true);
  };

  const fetchPosts = async () => {
    setLoading(true);
    const res = await fetch("/api/posts", {
      headers: { "x-admin-token": adminToken },
    });
    if (res.ok) {
      const data = await res.json();
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && adminToken) {
      fetchPosts();
    }
  }, [isAuthenticated, adminToken]);

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      description: "",
      content: "",
      tags: "",
      published: false,
    });
    setEditingPost(null);
    setIsCreating(false);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setIsCreating(true);
    setForm({
      title: post.title,
      slug: post.slug,
      description: post.description || "",
      content: post.content,
      tags: post.tags?.join(", ") || "",
      published: post.published,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      description: form.description || null,
      content: form.content,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      published: form.published,
    };

    const url = editingPost
      ? `/api/posts/${editingPost.slug}`
      : "/api/posts";
    const method = editingPost ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": adminToken,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      fetchPosts();
    } else {
      const error = await res.json();
      alert(error.error || "Failed to save post");
    }
    setLoading(false);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this post?")) return;

    const res = await fetch(`/api/posts/${slug}`, {
      method: "DELETE",
      headers: { "x-admin-token": adminToken },
    });

    if (res.ok) {
      fetchPosts();
    }
  };

  const togglePublish = async (post: Post) => {
    const res = await fetch(`/api/posts/${post.slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": adminToken,
      },
      body: JSON.stringify({ ...post, published: !post.published }),
    });

    if (res.ok) {
      fetchPosts();
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-8">
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <h1 className="text-xs uppercase tracking-wide mb-6">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 bg-transparent border border-[var(--foreground)]/20 text-sm focus:border-[var(--foreground)] focus:outline-none"
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-[var(--foreground)] text-[var(--background)] text-xs uppercase tracking-wide"
          >
            Login
          </button>
        </form>
      </main>
    );
  }

  // Editor view
  if (isCreating) {
    return (
      <main className="min-h-screen px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xs uppercase tracking-wide">
              {editingPost ? "Edit Post" : "New Post"}
            </h1>
            <button
              onClick={resetForm}
              className="text-xs uppercase tracking-wide px-3 py-2 border border-[var(--foreground)]/20 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-smooth"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wide mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-transparent border border-[var(--foreground)]/20 text-sm focus:border-[var(--foreground)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide mb-2">
                  Slug (auto-generated if empty)
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({ ...form, slug: e.target.value })
                  }
                  placeholder="my-post-url"
                  className="w-full px-4 py-3 bg-transparent border border-[var(--foreground)]/20 text-sm focus:border-[var(--foreground)] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide mb-2">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Brief description for listing page"
                className="w-full px-4 py-3 bg-transparent border border-[var(--foreground)]/20 text-sm focus:border-[var(--foreground)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="design, development, thoughts"
                className="w-full px-4 py-3 bg-transparent border border-[var(--foreground)]/20 text-sm focus:border-[var(--foreground)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide mb-2">
                Content (Markdown)
              </label>
              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                required
                rows={20}
                className="w-full px-4 py-3 bg-transparent border border-[var(--foreground)]/20 text-sm font-mono focus:border-[var(--foreground)] focus:outline-none resize-none"
                placeholder="Write your post in Markdown..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={form.published}
                onChange={(e) =>
                  setForm({ ...form, published: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="published" className="text-xs uppercase tracking-wide">
                Published
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] text-xs uppercase tracking-wide hover:opacity-80 transition-smooth disabled:opacity-50"
            >
              {loading ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Posts list view
  return (
    <main className="min-h-screen px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xs uppercase tracking-wide">Blog Admin</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="text-xs uppercase tracking-wide px-4 py-2 bg-[var(--foreground)] text-[var(--background)] hover:opacity-80 transition-smooth"
          >
            New Post
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-[var(--foreground)]/50">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-xs text-[var(--foreground)]/50">
            No posts yet. Create your first post.
          </p>
        ) : (
          <div className="space-y-1">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between py-4 border-b border-[var(--foreground)]/10"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-medium truncate">{post.title}</h2>
                    <span
                      className={`text-xs uppercase tracking-wide px-2 py-0.5 ${
                        post.published
                          ? "bg-green-500/20 text-green-600"
                          : "bg-yellow-500/20 text-yellow-600"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--foreground)]/50 mt-1">
                    /{post.slug} &middot;{" "}
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => togglePublish(post)}
                    className="text-xs uppercase tracking-wide px-3 py-1.5 border border-[var(--foreground)]/20 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-smooth"
                  >
                    {post.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-xs uppercase tracking-wide px-3 py-1.5 border border-[var(--foreground)]/20 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-smooth"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.slug)}
                    className="text-xs uppercase tracking-wide px-3 py-1.5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-smooth"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
