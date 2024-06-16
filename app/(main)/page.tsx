import { auth } from "@/lib/auth";

import PostCard from "@/components/post-card";
import { CreateInputField } from "@/components/create-input-field";
import {
  getPostCountFromUsers,
  getPosts,
  getPostsWithComments,
} from "@/lib/queries";
import { db } from "@/db/db";

export default async function Home() {
  const session = await auth();

  const posts = await getPosts();
  // console.log("posts", posts);

  // if (session?.user)
  //   await db.insert(LikeTable).values({
  //     userId: session?.user.id,
  //     postId: "6a678233-72aa-4faf-be8d-b6907952b21d",
  //     likes: 1,
  //   });
  // const x = await getPostCountFromUsers();
  // console.log("x", x);
  // const y = await getPostsWithComments();
  // console.log(
  //   "y",
  //   y.map((x) => x.comments)
  // );
  // console.log("legth", y.length);
  return (
    <div className="h-full py-10 ">
      <div className="px-2 mb-4">
        {session?.user && <CreateInputField type="post" actionType="create" />}
      </div>
      {posts.length > 0 &&
        posts.map((post) => {
          return (
            <div key={post.id} className=" ">
              <PostCard post={post} />
            </div>
          );
        })}
    </div>
  );
}
