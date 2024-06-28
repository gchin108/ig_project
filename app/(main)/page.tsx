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

  return (
    <div className="py-10">
      <div className="px-2 mb-4">
        {session?.user && <CreateInputField type="post" actionType="create" />}
      </div>
      {posts.length > 0 &&
        posts.map((post) => {
          return (
            <div key={post.id} className=" ">
              <PostCard post={post} mode="normal" />
            </div>
          );
        })}
    </div>
  );
}
