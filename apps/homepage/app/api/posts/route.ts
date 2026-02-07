import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabase } from "@/lib/supabase";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// GET /api/posts - List all posts with counts
export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id") || "";

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get comment counts and like counts for all posts
  const postIds = posts.map((p) => p.id);

  const [{ data: commentCounts }, { data: likeCounts }, { data: userLikes }] =
    await Promise.all([
      supabase.rpc("get_comment_counts", { post_ids: postIds }),
      supabase.rpc("get_like_counts", { post_ids: postIds }),
      userId
        ? supabase
            .from("likes")
            .select("post_id")
            .eq("user_id", userId)
            .in("post_id", postIds)
        : Promise.resolve({ data: [] }),
    ]);

  const commentCountMap = new Map(
    (commentCounts || []).map((r: { post_id: string; count: number }) => [
      r.post_id,
      r.count,
    ])
  );
  const likeCountMap = new Map(
    (likeCounts || []).map((r: { post_id: string; count: number }) => [
      r.post_id,
      r.count,
    ])
  );
  const userLikeSet = new Set(
    (userLikes || []).map((r: { post_id: string }) => r.post_id)
  );

  const result = posts.map((post) => ({
    ...post,
    comment_count: commentCountMap.get(post.id) || 0,
    like_count: likeCountMap.get(post.id) || 0,
    liked_by_user: userLikeSet.has(post.id),
  }));

  return NextResponse.json(result);
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content, display_author, author_id, tags, is_admin } = body;

  if (!title?.trim() || !content?.trim() || !author_id) {
    return NextResponse.json(
      { error: "title, content, and author_id are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: title.trim(),
      content: content.trim(),
      display_author: display_author?.trim() || "Anonymous",
      author_id,
      tags: tags || [],
      is_admin: is_admin || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send email notification (fire-and-forget)
  const tagLabel = tags?.length ? `[${tags.join(", ")}] ` : "";
  transporter
    .sendMail({
      from: `게시판 봇 <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_DEST,
      subject: `새 게시글: ${tagLabel}${title.trim()}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px">
          <p style="color:#6b7280;font-size:13px;margin:0 0 12px">익명게시판에 새 글이 등록되었습니다.</p>
          ${tags?.length ? `<p style="margin:0 0 8px"><span style="background:#f3e8ff;color:#9333ea;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:bold">${tags[0]}</span></p>` : ""}
          <h2 style="margin:0 0 8px;font-size:17px">${title.trim()}</h2>
          <p style="color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap">${content.trim().slice(0, 300)}</p>
          <p style="color:#9ca3af;font-size:12px;margin-top:16px">작성자: ${display_author?.trim() || "익명"}</p>
        </div>
      `,
    })
    .then((res) => console.log("[SMTP] 메일 발송 성공:", res.messageId))
    .catch((err) => console.error("[SMTP] 메일 발송 실패:", err));

  return NextResponse.json(
    { ...data, comment_count: 0, like_count: 0, liked_by_user: false },
    { status: 201 }
  );
}
