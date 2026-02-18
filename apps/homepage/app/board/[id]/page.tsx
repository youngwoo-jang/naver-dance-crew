"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import {
  usePost,
  useDeletePost,
  useToggleLike,
  useComments,
  useCreateComment,
  useDeleteComment,
} from "@/lib/posts-context";
import { useLocalUser } from "@/lib/use-local-user";
import { useAdmin } from "@/lib/use-admin";
import { formatRelativeTime } from "@/lib/utils";
import { MeatballMenu } from "@/components/ui/MeatballMenu";
import { LikeButton } from "@/components/ui/LikeButton";
import { getTagStyle } from "@/lib/tags";
import * as gtag from "@/lib/gtag";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = useLocalUser();
  const { isAdmin, adminQuery } = useAdmin();
  const postId = params.id as string;

  const { data: post, isLoading } = usePost(postId);
  const { data: comments } = useComments(postId);
  const deletePost = useDeletePost();
  const toggleLike = useToggleLike(postId);
  const createComment = useCreateComment(postId);
  const deleteComment = useDeleteComment(postId);

  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="size-6 border-2 border-gray-200 border-t-gray-500 rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!post) {
    router.replace(`/board${adminQuery}`);
    return null;
  }

  const isOwner = !!userId && userId === post.author_id;
  const isLiked = post.liked_by_user;

  const handleDelete = () => {
    if (window.confirm("이 게시글을 삭제하시겠습니까?")) {
      gtag.event("delete_post", { post_id: postId });
      deletePost.mutate(postId, {
        onSuccess: () => router.push(`/board${adminQuery}`),
      });
    }
  };

  const handleEdit = () => {
    router.push(`/board/edit/${postId}${adminQuery}`);
  };

  const handleToggleLike = () => {
    if (!userId) return;
    gtag.event(isLiked ? "unlike_post" : "like_post", { post_id: postId });
    toggleLike.mutate();
  };

  const handleSubmitComment = () => {
    if (!commentText.trim() || !userId) return;
    const text = commentText.trim();
    setCommentText("");
    gtag.event("create_comment", { post_id: postId });
    createComment.mutate({
      content: text,
      display_author: isAdmin ? "운영진" : "익명",
      is_admin: isAdmin || undefined,
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm("이 댓글을 삭제하시겠습니까?")) {
      gtag.event("delete_comment", { post_id: postId, comment_id: commentId });
      deleteComment.mutate(commentId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative" style={{ animation: "fadeIn 0.3s ease both" }}>
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-white/90 ios-blur px-4 py-3 border-b border-border-light">
        <Link href={`/board${adminQuery}`} className="flex items-center text-black">
          <span className="material-symbols-outlined text-[22px]">
            arrow_back_ios
          </span>
        </Link>
        <h1 className="text-[15px] font-semibold tracking-tight">
          게시글 상세
        </h1>
        <div className="w-8" />
      </header>

      {/* Content */}
      <main className="flex-1 px-5 pt-6 pb-6">
        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-1.5 mb-4">
            {post.tags.map((tag) => {
              const s = getTagStyle(tag);
              return (
                <span key={tag} className={`px-1.5 py-0.5 rounded ${s.bg} ${s.text} text-[10px] font-bold`}>
                  {tag}
                </span>
              );
            })}
          </div>
        )}
        {/* Author Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
              <span className="material-symbols-outlined text-[20px]">
                person
              </span>
            </div>
            <div>
              {post.is_admin ? (
                <span className="text-[14px] font-bold text-blue-500">운영진</span>
              ) : (
                <h3 className="text-[14px] font-bold text-zinc-900">
                  {post.display_author}
                </h3>
              )}
              <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                {formatRelativeTime(new Date(post.created_at))}
              </p>
            </div>
          </div>
          {(isOwner || isAdmin) && (
            <MeatballMenu onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>

        {/* Article */}
        <article className="mb-8">
          <h2 className="text-[17px] font-bold text-zinc-900 mb-3">
            {post.title}
          </h2>
          <ContentRenderer content={post.content} />
        </article>

        {/* Actions */}
        <div className="flex items-center gap-5 pb-8 border-b border-border-light">
          <LikeButton
            liked={isLiked}
            count={post.like_count}
            disabled={!userId}
            onToggle={handleToggleLike}
          />
          <button
            className="flex items-center gap-1.5 text-zinc-400"
            onClick={() => {
              commentInputRef.current?.focus();
              commentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <span className="material-symbols-outlined text-[20px]">
              chat_bubble
            </span>
            <span className="text-[13px] font-medium">{post.comment_count}</span>
          </button>
        </div>

        {/* Comment Input */}
        <div className="mt-6 flex gap-3 relative">
          <div className="size-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[14px]">
              person
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <input
              ref={commentInputRef}
              className="w-full bg-transparent border-none focus:ring-0 text-[14px] p-0 pb-2 placeholder:text-zinc-400 text-zinc-900 outline-none border-b border-zinc-200 focus:border-zinc-400 transition-colors"
              placeholder="댓글을 입력하세요..."
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
          </div>
          {commentText.trim() && (
            <button
              onClick={handleSubmitComment}
              disabled={createComment.isPending}
              className="absolute top-0 right-0 text-zinc-900 font-bold text-[12px] disabled:opacity-30"
            >
              게시
            </button>
          )}
        </div>

        {/* Comments List */}
        {comments && comments.length > 0 && (
          <div className="mt-5 flex flex-col gap-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="size-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">
                    person
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {comment.is_admin ? (
                      <span className="text-[13px] font-bold text-blue-500">운영진</span>
                    ) : (
                      <span className="text-[13px] font-bold text-zinc-900">
                        {comment.display_author}
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-400">
                      {formatRelativeTime(new Date(comment.created_at))}
                    </span>
                    {(isAdmin || (userId && userId === comment.author_id)) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-[11px] text-red-400 hover:text-red-600 ml-auto"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="text-[14px] text-zinc-700 mt-0.5 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
