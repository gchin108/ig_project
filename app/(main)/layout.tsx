import { auth } from "@/lib/auth";
import PostnProvider from "@/store/postProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const sessionUser = {
    id: session?.user.id,
    name: session?.user.name,
    image: session?.user.image,
  };
  return (
    <div className="bg-slate-900">
      <PostnProvider sessionUser={sessionUser}>{children}</PostnProvider>
    </div>
  );
}
