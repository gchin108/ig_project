import { auth } from "@/lib/auth";

import PostCard from "@/components/post-card";
import PostCard2 from "@/components/post-card2";
import { CreateInputField } from "@/components/create-input-field";
import { Suspense } from "react";
import Loading from "./loading";
import {
  followerLikes,
  getLikedPostsByUserId,
  getPosts,
} from "@/actions/queries";
import { AllPosts } from "@/components/all-posts";
import { NewInput } from "@/components/newInput";

export default async function Home() {
  const session = await auth();

  const posts = await getPosts();

  // console.log("allposts", allposts);
  // if (!allposts) return;
  // const { data } = await followerLikes();
  // console.log("data", data);
  // console.log("listLength", listLength);
  // console.log("posts", posts);

  return (
    <div className="py-10">
      <div className="px-2 mb-4">
        {session?.user && <NewInput type="post" actionType="create" />}
      </div>
      {posts.length > 0 &&
        posts.map((post) => {
          return (
            <div key={post.id} className=" ">
              <Suspense fallback={<Loading />}>
                <PostCard post={post} mode="normal" />
                {/* <AllPosts post={post} mode="normal" /> */}
              </Suspense>
            </div>
          );
        })}
    </div>
  );
}
