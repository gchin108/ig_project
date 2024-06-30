import { cache } from "react";
import { db } from "@/db/db";
import { eq, inArray, sql } from "drizzle-orm";
import { UserTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getPosts = cache(async () => {
  const session = await auth();
  // console.log("session", session?.user.id);
  const posts = await db.query.PostTable.findMany({
    orderBy: (post, { asc }) => [asc(post.created_at)],

    with: {
      postAuthor: {
        with: {
          likes: true,
        },
      },
      likes: true,
      comments: {
        orderBy: (comments, { asc }) => [asc(comments.created_at)],
        with: {
          commentUser: true,
          parentComment: true,
          replyReceiver: true,
          likes: true,
        },
      },
    },
  });
  const normalizedData = posts.map((post) => {
    const commentsWithLikes = post.comments.map((comment) => {
      const likeByCurrentUser =
        session?.user.id ===
        comment.likes.find((like) => {
          return like.userId === session?.user.id;
        })?.userId;
      return { likeByCurrentUser, ...comment };
    });

    const postLikeByCurrentUser =
      session?.user.id ===
      post.likes.find((like) => {
        return like.userId === session?.user.id;
      })?.userId;

    // Assign commentsWithLikes to comments before spreading other properties
    return {
      ...post,
      likeByCurrentUser: postLikeByCurrentUser,
      comments: commentsWithLikes,
    };
  });

  return normalizedData;
});

export const getAllPostsByUserId = cache(async (userId: string) => {
  const session = await auth();
  // console.log("session", session?.user.id);
  const userData = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),

    with: {
      followers: true,
      following: true,
      posts: {
        orderBy: (post, { asc }) => [asc(post.created_at)],
        with: {
          postAuthor: {
            with: {
              likes: true,
            },
          },
          likes: true,
          comments: {
            orderBy: (comments, { asc }) => [asc(comments.created_at)],
            with: {
              commentUser: true,
              parentComment: true,
              replyReceiver: true,
              likes: true,
            },
          },
        },
      },
    },
  });
  if (!userData) {
    throw new Error("User not found");
  }
  const allPosts = userData?.posts || [];
  const numberOfPosts = allPosts.length;
  const normalizedData = allPosts.map((post) => {
    const commentsWithLikes = post.comments.map((comment) => {
      const likeByCurrentUser =
        session?.user.id ===
        comment.likes.find((like) => {
          return like.userId === session?.user.id;
        })?.userId;
      return { likeByCurrentUser, ...comment };
    });

    const postLikeByCurrentUser =
      session?.user.id ===
      post.likes.find((like) => {
        return like.userId === session?.user.id;
      })?.userId;

    // Assign commentsWithLikes to comments before spreading other properties
    return {
      ...post,
      likeByCurrentUser: postLikeByCurrentUser,
      comments: commentsWithLikes,
    };
  });
  const followerIds = userData.followers.map((follower) => follower.followerId);
  const followingIds = userData.following.map(
    (following) => following.leaderId
  );
  // console.log("followerIds", followerIds);

  async function getList(list: string[], type: "follower" | "following") {
    if (list.length === 0) return [];

    if (type === "follower") {
      const followerList = await db
        .select()
        .from(UserTable)
        .where(inArray(UserTable.id, list));
      return followerList;
    } else if (type === "following") {
      const followingList = await db
        .select()
        .from(UserTable)
        .where(inArray(UserTable.id, list));
      return followingList;
    } else {
      return [];
    }
  }
  const followerList = await getList(followerIds, "follower");
  const followingList = await getList(followingIds, "following");

  const user = { numberOfPosts, followerList, followingList, ...userData };

  return { user, posts: normalizedData };
});

// export const getPostsWithComments = cache(async () => {
//   const posts = await db.select().from(PostTable);
//   const postIds = posts.map((post) => post.id);
//   const comments = await db
//     .select()
//     .from(CommentTable)
//     .where(inArray(CommentTable.postId, postIds));
//   const postsWithComments = posts.map((post) => ({
//     ...post,
//     comments: comments.filter((comment) => comment.postId === post.id),
//   }));
//   return postsWithComments;
// });

// export const getPostCountFromUsers = cache(async () => {
//   const session = await auth();
//   //  WHERE p.author_id = ${session?.user.id}
//   const posts = await db.execute(sql`
//       SELECT p.author_id, name, COUNT(*) as totalPosts
//       FROM ${PostTable} as p
//        JOIN ${UserTable} ON ${UserTable.id} = p.author_id
//       GROUP BY name,p.author_id;
//       `);

//   return posts;
// });

// export const getPostById = cache(
//   async (id: string, type: "post" | "comment" | "reply") => {
//     if (type === "comment") {
//       const comment = await db.query.CommentTable.findFirst({
//         where: eq(CommentTable.id, id),
//         columns: {
//           content: true,
//         },
//       });
//       return comment;
//     }
//   }
// );

// export const getUserWithPost = cache(async (userId: string) => {
//   try {
//     // Query the database for the user and their posts, likes, and comments
//     const userData = await db.query.UserTable.findFirst({
//       where: eq(UserTable.id, userId),
//       with: {
//         posts: {
//           with: {
//             likes: true,
//             comments: true,
//           },
//         },
//       },
//     });

//     if (!userData) {
//       throw new Error("User not found");
//     }

//     // Extract posts and count the number of posts
//     const posts = userData.posts || [];
//     const numberOfPosts = posts.length;

//     // Create a user object with an additional property for the number of posts
//     const user = { ...userData, numberOfPosts };

//     // Return the user and posts
//     return { user, posts };
//   } catch (error) {
//     console.error("Error fetching user with posts:", error);
//     throw new Error("Failed to fetch user with posts");
//   }
// });
