import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET all posts (published only for public, all for admin)
export async function GET(request: NextRequest) {
  const isAdmin = request.headers.get("x-admin-token") === process.env.ADMIN_PASSWORD;

  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (!isAdmin) {
    query = query.eq("published", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST create new post
export async function POST(request: NextRequest) {
  const adminToken = request.headers.get("x-admin-token");

  if (adminToken !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Generate slug from title if not provided
  const slug = body.slug || body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data, error } = await supabase
    .from("posts")
    .insert({
      slug,
      title: body.title,
      description: body.description || null,
      content: body.content,
      tags: body.tags || [],
      published: body.published ?? false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
