"use client";

import { Suspense, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/ui/BottomNav";
import { MeatballMenu } from "@/components/ui/MeatballMenu";
import { usePosts, useDeletePost, useToggleLike } from "@/lib/posts-context";
import { useLocalUser } from "@/lib/use-local-user";
import { useAdmin } from "@/lib/use-admin";
import { formatRelativeTime } from "@/lib/utils";
import { replaceYouTubeUrls } from "@/components/ui/ContentRenderer";
import { getTagStyle } from "@/lib/tags";

function PostLikeButton({ postId, liked, count, disabled }: { postId: string; liked: boolean; count: number; disabled: boolean }) {
  const toggleLike = useToggleLike(postId);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) toggleLike.mutate();
      }}
      className={`flex items-center gap-1 transition-colors ${
        liked ? "text-red-500" : "text-ios-text-secondary"
      }`}
    >
      <span className={`material-symbols-outlined text-[16px] ${liked ? "fill-1" : ""}`}>
        favorite
      </span>
      <span className="text-[12px]">{count}</span>
    </button>
  );
}

function BoardPageContent() {
  const router = useRouter();
  const userId = useLocalUser();
  const { isAdmin, adminQuery } = useAdmin();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts();
  const posts = data?.pages.flatMap((p) => p.posts);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchNextPageRef = useRef(fetchNextPage);
  fetchNextPageRef.current = fetchNextPage;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPageRef.current();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const deletePost = useDeletePost();

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 ios-blur border-b border-ios-divider">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-1">
            <h1 className="text-[20px] font-bold tracking-tight">
              익명게시판
            </h1>
          </div>
        </div>
      </header>

      {/* Posts */}
      <main className="flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-[14px] text-gray-400">불러오는 중...</span>
          </div>
        ) : !posts?.length ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-[14px] text-gray-400">아직 게시글이 없습니다</span>
          </div>
        ) : (
          posts.map((post) => {
            const isOwner = !!userId && userId === post.author_id;
            return (
            <div
              key={post.id}
              className="px-5 py-5 post-divider active:bg-gray-50 transition-colors relative"
            >
              <Link
                href={`/board/${post.id}${adminQuery}`}
                className="block"
              >
              <div className="flex flex-col gap-1.5">
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-1.5">
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
                <h3 className="text-[16px] font-bold leading-snug pr-8">
                  {post.title}
                </h3>
                <p className="text-[14px] text-gray-600 line-clamp-2 leading-relaxed">
                  {replaceYouTubeUrls(post.content)}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1 text-ios-text-secondary">
                    {post.is_admin ? (
                      <span className="text-[12px] font-bold text-blue-500">운영진</span>
                    ) : (
                      <span className="text-[12px]">{post.display_author}</span>
                    )}
                    <span className="text-[10px]">&bull;</span>
                    <span className="text-[12px]">
                      {formatRelativeTime(new Date(post.created_at))}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="flex items-center gap-1 text-ios-text-secondary">
                      <span className="material-symbols-outlined text-[16px]">
                        chat_bubble
                      </span>
                      <span className="text-[12px]">{post.comment_count}</span>
                    </div>
                    <PostLikeButton
                      postId={post.id}
                      liked={post.liked_by_user}
                      count={post.like_count}
                      disabled={!userId}
                    />
                  </div>
                </div>
              </div>
              </Link>
              {(isOwner || isAdmin) && (
                <div
                  className="absolute top-4 right-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MeatballMenu
                    onEdit={() => router.push(`/board/edit/${post.id}${adminQuery}`)}
                    onDelete={() => {
                      if (window.confirm("이 게시글을 삭제하시겠습니까?")) {
                        deletePost.mutate(post.id);
                      }
                    }}
                  />
                </div>
              )}
            </div>
            );
          })
        )}
        {hasNextPage && (
          <div ref={sentinelRef} className="flex items-center justify-center py-6">
            {isFetchingNextPage && (
              <span className="text-[14px] text-gray-400">불러오는 중...</span>
            )}
          </div>
        )}
        <div className="h-40" />
      </main>

      {/* FAB */}
      <Link
        href={`/board/new${adminQuery}`}
        className="fixed bottom-28 right-6 size-12 bg-black text-white rounded-full shadow-lg flex items-center justify-center z-50 active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-[24px]">
          edit_note
        </span>
      </Link>

      <BottomNav adminQuery={adminQuery} />
    </div>
  );
}

export default function BoardPage() {
  return (
    <Suspense>
      <BoardPageContent />
    </Suspense>
  );
}
