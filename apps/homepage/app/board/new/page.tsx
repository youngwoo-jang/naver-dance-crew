"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useCreatePost } from "@/lib/posts-context";
import { useAdmin } from "@/lib/use-admin";
import PostForm from "../_components/post-form";
import * as gtag from "@/lib/gtag";

function CreatePostContent() {
  const router = useRouter();
  const createPost = useCreatePost();
  const { isAdmin, adminQuery } = useAdmin();

  return (
    <PostForm
      headerTitle="글쓰기"
      submitLabel="등록"
      isPending={createPost.isPending}
      isAdmin={isAdmin}
      adminQuery={adminQuery}
      onSubmit={(data) => {
        createPost.mutate({
          ...data,
          tags: data.tags,
          display_author: isAdmin ? "운영진" : data.display_author,
          is_admin: isAdmin || undefined,
        });
        gtag.event("create_post", { tags: (data.tags ?? []).join(",") });
        router.push(`/board${adminQuery}`);
      }}
    />
  );
}

export default function CreatePostPage() {
  return (
    <Suspense>
      <CreatePostContent />
    </Suspense>
  );
}
