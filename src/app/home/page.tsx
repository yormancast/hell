import BrowseMusic from "../ui/home/browse"

export default function Home() {
  return (
    <section className="home-page w-full">
      <BrowseMusic/>
      <h2>for you</h2> 
      {/* top albums eventually get scrobbles */}
      <h2>top picks</h2>
      {/* top songs */}
    </section>
  );
}
