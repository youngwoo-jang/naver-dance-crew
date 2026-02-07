import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/posts/[id]/likes - Toggle like
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { user_id } = body;

  if (!user_id) {
    return NextResponse.json(
      { error: "user_id is required" },
      { status: 400 }
    );
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", id)
    .eq("user_id", user_id)
    .maybeSingle();

  if (existing) {
    // Unlike
    await supabase.from("likes").delete().eq("id", existing.id);
  } else {
    // Like
    const { error } = await supabase
      .from("likes")
      .insert({ post_id: id, user_id });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Return updated count
  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);

  return NextResponse.json({
    liked: !existing,
    like_count: count || 0,
  });
}
