import { Post, PostsPage, Comment, CreatePostInput, CreateCommentInput } from "@/types/post";

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function getUserId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("board-user-id");
  if (!id) {
    id = generateId();
    localStorage.setItem("board-user-id", id);
  }
  return id;
}

function headers() {
  return {
    "Content-Type": "application/json",
    "x-user-id": getUserId(),
  };
}

// Posts
export async function fetchPosts(cursor?: string): Promise<PostsPage> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", "20");
  const res = await fetch(`/api/posts?${params}`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`/api/posts/${id}`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const { is_admin, ...rest } = input;
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ ...rest, author_id: getUserId(), is_admin }),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
}

export async function updatePost(
  id: string,
  input: Partial<CreatePostInput>
): Promise<Post> {
  const res = await fetch(`/api/posts/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update post");
  return res.json();
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`/api/posts/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Failed to delete post");
}

// Comments
export async function fetchComments(postId: string): Promise<Comment[]> {
  const res = await fetch(`/api/posts/${postId}/comments`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export async function createComment(
  postId: string,
  input: CreateCommentInput
): Promise<Comment> {
  const { is_admin, ...rest } = input;
  const res = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ ...rest, author_id: getUserId(), is_admin }),
  });
  if (!res.ok) throw new Error("Failed to create comment");
  return res.json();
}

export async function deleteComment(
  postId: string,
  commentId: string
): Promise<void> {
  const res = await fetch(`/api/posts/${postId}/comments?commentId=${commentId}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Failed to delete comment");
}

// Likes
export async function toggleLike(
  postId: string
): Promise<{ liked: boolean; like_count: number }> {
  const res = await fetch(`/api/posts/${postId}/likes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ user_id: getUserId() }),
  });
  if (!res.ok) throw new Error("Failed to toggle like");
  return res.json();
}
