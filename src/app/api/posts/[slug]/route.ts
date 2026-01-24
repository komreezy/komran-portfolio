import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  params: Promise<{ slug: string }>;
}

// GET single post by slug
export async function GET(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  const isAdmin = request.headers.get("x-admin-token") === process.env.ADMIN_PASSWORD;

  let query = supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!isAdmin) {
    query = supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();
  }

  const { data, error } = await query;

  if (error || !data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT update post
export async function PUT(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  const adminToken = request.headers.get("x-admin-token");

  if (adminToken !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("posts")
    .update({
      title: body.title,
      description: body.description,
      content: body.content,
      tags: body.tags,
      published: body.published,
      slug: body.slug,
    })
    .eq("slug", slug)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE post
export async function DELETE(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  const adminToken = request.headers.get("x-admin-token");

  if (adminToken !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
