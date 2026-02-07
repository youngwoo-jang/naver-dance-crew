export interface Post {
  id: string;
  title: string;
  content: string;
  display_author: string;
  author_id: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  comment_count: number;
  like_count: number;
  liked_by_user: boolean;
  is_admin?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  display_author: string;
  author_id: string;
  created_at: string;
  is_admin?: boolean;
}

export interface CreatePostInput {
  title: string;
  content: string;
  display_author: string;
  tags?: string[];
  is_admin?: boolean;
}

export interface CreateCommentInput {
  content: string;
  display_author: string;
  is_admin?: boolean;
}
