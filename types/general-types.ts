export type LikeData = {
  userId: string;
  postId?: string;
  commentId?: string;
  type: "post" | "comment";
};
