"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePost, useUpdatePost } from "@/lib/posts-context";
import { useLocalUser } from "@/lib/use-local-user";
import { useAdmin } from "@/lib/use-admin";
import PostForm from "../../_components/post-form";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const userId = useLocalUser();
  const { isAdmin, adminQuery } = useAdmin();
  const postId = params.id as string;
  const { data: post, isLoading } = usePost(postId);
  const updatePost = useUpdatePost();

  const initialValues = useMemo(
    () =>
      post
        ? {
            title: post.title,
            content: post.content,
            displayAuthor: post.display_author,
            tags: post.tags,
          }
        : undefined,
    [post]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="text-[14px] text-gray-400">불러오는 중...</span>
      </div>
    );
  }

  if (!post) {
    router.replace(`/board${adminQuery}`);
    return null;
  }

  if (!isAdmin && userId && userId !== post.author_id) {
    router.replace(`/board/${postId}${adminQuery}`);
    return null;
  }

  return (
    <PostForm
      headerTitle="글 수정"
      submitLabel="저장"
      isPending={updatePost.isPending}
      initialValues={initialValues}
      isAdmin={isAdmin}
      adminQuery={adminQuery}
      onSubmit={(data) =>
        updatePost.mutate(
          { id: postId, input: { ...data, tags: data.tags } },
          {
            onSuccess: () => router.push(`/board/${postId}${adminQuery}`),
          }
        )
      }
    />
  );
}
