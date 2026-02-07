"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { Post, CreatePostInput, CreateCommentInput, Comment } from "@/types/post";

// Posts hooks
export function usePosts() {
  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: api.fetchPosts,
  });
}

export function usePost(id: string) {
  return useQuery<Post>({
    queryKey: ["posts", id],
    queryFn: () => api.fetchPost(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => api.createPost(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

      const optimisticPost: Post = {
        id: `temp-${Date.now()}`,
        title: input.title,
        content: input.content,
        display_author: input.display_author,
        author_id: "",
        tags: input.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        comment_count: 0,
        like_count: 0,
        liked_by_user: false,
        is_admin: input.is_admin,
      };

      if (previousPosts) {
        queryClient.setQueryData<Post[]>(["posts"], [optimisticPost, ...previousPosts]);
      }

      return { previousPosts };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreatePostInput> }) =>
      api.updatePost(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", variables.id] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// Comments hooks
export function useComments(postId: string) {
  return useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: () => api.fetchComments(postId),
    enabled: !!postId,
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentInput) => api.createComment(postId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousComments = queryClient.getQueryData<Comment[]>(["comments", postId]);
      const previousPost = queryClient.getQueryData<Post>(["posts", postId]);
      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        post_id: postId,
        content: input.content,
        display_author: input.display_author,
        author_id: "",
        created_at: new Date().toISOString(),
        is_admin: input.is_admin,
      };

      if (previousComments) {
        queryClient.setQueryData<Comment[]>(["comments", postId], [...previousComments, optimisticComment]);
      }

      if (previousPost) {
        queryClient.setQueryData<Post>(["posts", postId], {
          ...previousPost,
          comment_count: previousPost.comment_count + 1,
        });
      }

      if (previousPosts) {
        queryClient.setQueryData<Post[]>(["posts"], previousPosts.map((p) =>
          p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p
        ));
      }

      return { previousComments, previousPost, previousPosts };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments", postId], context.previousComments);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(["posts", postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => api.deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// Likes hook
export function useToggleLike(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.toggleLike(postId),
    onMutate: async () => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["posts", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot previous values for rollback
      const previousPost = queryClient.getQueryData<Post>(["posts", postId]);
      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

      // Optimistically update the post detail cache
      if (previousPost) {
        queryClient.setQueryData<Post>(["posts", postId], {
          ...previousPost,
          liked_by_user: !previousPost.liked_by_user,
          like_count: previousPost.liked_by_user
            ? previousPost.like_count - 1
            : previousPost.like_count + 1,
        });
      }

      // Optimistically update the posts list cache
      if (previousPosts) {
        queryClient.setQueryData<Post[]>(
          ["posts"],
          previousPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  liked_by_user: !p.liked_by_user,
                  like_count: p.liked_by_user
                    ? p.like_count - 1
                    : p.like_count + 1,
                }
              : p
          )
        );
      }

      return { previousPost, previousPosts };
    },
    onError: (_err, _vars, context) => {
      // Rollback to previous values on error
      if (context?.previousPost) {
        queryClient.setQueryData(["posts", postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["posts", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
