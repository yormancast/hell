import Link from "next/link";

export default async function BrowseMusic() {
  const getPopularGenre = await fetch(`${process.env.NEXT_PUBLIC_HOST_NAME}/api/topTags`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });
  const res = await getPopularGenre.json();
  const popularTags = res.tags;

  return (
    <section className="browse-list">
      <h2>browse</h2>
      <nav className="inline-flex w-full items-center content-center overflow-x-scroll">
        {/* <Link key="popular" href="" className="m-1 ">popular</Link>
        <Link key="artist" href="" className="m-1">artist</Link>
        <Link key="genres" href="" className="m-1">genres</Link> */}
        {popularTags.map((link: { id: string; name: string }) => {
          return (<Link key={link.id} href={`/genre/${link.name}`} className="m-1 min-w-fit">{link.name}</Link>)
        })}
      </nav>
    </section>
  )
}
