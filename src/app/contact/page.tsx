"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Marquee from "@/components/Marquee";

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "GitHub", href: "https://github.com" },
];

export default function ContactPage() {
  const [formState, setFormState] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ready for backend integration (e.g., Resend)
    // For now, just simulate success
    setFormState("success");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <main className="min-h-screen">
      <Marquee />
      <Header />

      <section className="max-w-xl mx-auto px-8 pt-32 pb-16">
        <div className="mb-12">
          <h1 className="text-xs uppercase tracking-wide mb-2">Get in Touch</h1>
          <p className="text-xs text-[var(--foreground)]/50">
            Have a project in mind? Let&apos;s talk.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mb-12">
          <div>
            <label
              htmlFor="name"
              className="block text-xs uppercase tracking-wide mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-transparent border border-[var(--foreground)]/20 text-sm focus:border-[var(--foreground)] focus:outline-none transition-smooth"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-wide mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-transparent border border-[var(--foreground)]/20 text-sm focus:border-[var(--foreground)] focus:outline-none transition-smooth"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-xs uppercase tracking-wide mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
              rows={5}
              className="w-full px-4 py-3 bg-transparent border border-[var(--foreground)]/20 text-sm focus:border-[var(--foreground)] focus:outline-none transition-smooth resize-none"
              placeholder="Tell me about your project..."
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-[var(--foreground)] text-[var(--background)] text-xs uppercase tracking-wide hover:opacity-80 transition-smooth"
          >
            Send Message
          </button>

          {formState === "success" && (
            <p className="text-xs text-green-600">
              Message sent! I&apos;ll get back to you soon.
            </p>
          )}
          {formState === "error" && (
            <p className="text-xs text-red-600">
              Something went wrong. Please try again.
            </p>
          )}
        </form>

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
