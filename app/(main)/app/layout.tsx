import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { auth } from "@/lib/auth";
import PostProvider from "@/store/postProvider";

export default async function MainLayout({
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
    <>
      <MobileHeader />
      <Sidebar className="hidden lg:flex" />
      <main className="lg:pl-[256px] h-full pt-[50px] lg:pt-0 ">
        <div className="h-full max-w-[1056px] mx-auto pt-6  ">
          <PostProvider sessionUser={sessionUser}>{children}</PostProvider>
        </div>
      </main>
    </>
  );
}
