export type LikeData = {
  userId: string;
  postId?: string;
  commentId?: string;
  postAuthorId?: string;
  commentUserId?: string;
  type: "post" | "comment";
};
