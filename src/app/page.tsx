import Link from "next/link.js";

export default function HomePage() {
  return (
    <>
      <section className="h-screen bg-gray-950 text-white">
        <article className="flex justify-center items-center h-full">
          <Link href={"/auth"}>
            <h2 className="text-5xl">Next Chat</h2>
          </Link>
        </article>
      </section>
    </>
  );
}
