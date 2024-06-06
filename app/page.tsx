import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex justify-center ">
      <Link href="/create">Create</Link>
    </main>
  );
}
