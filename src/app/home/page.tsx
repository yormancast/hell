import { DiscoveryNode, DiscoveryResponse } from "@/types/music";
import DiscoveryLogger from "@/app/ui/home/discoveryLogger";

type HomePageProps = {
  searchParams?: {
    type?: string;
    value?: string;
  };
};

function createHomeHref(type: string, value: string) {
  const params = new URLSearchParams({
    type,
    value,
  });

  return `/home?${params.toString()}`;
}

function filterNodesByType(nodes: DiscoveryNode[], type: DiscoveryNode["type"], centerId: string) {
  return nodes.filter((node) => node.type === type && node.id !== centerId);
}

function renderNodeList(nodes: DiscoveryNode[]) {
  if (nodes.length === 0) {
    return <p>Nothing here yet.</p>;
  }

  return (
    <ul className="list-disc pl-6">
      {nodes.map((node) => (
        <li key={node.id}>
          <a href={createHomeHref(node.type, node.label)}>
            {node.label}
          </a>
          {` `}
          <small>
            {node.sublabel ?? node.type}
          </small>
        </li>
      ))}
    </ul>
  );
}

export default async function Home({ searchParams }: HomePageProps) {
  const requestedType = searchParams?.type;
  const seedType =
    requestedType === "artist" || requestedType === "album" ? requestedType : "tag";
  const seedValue = searchParams?.value?.trim() || "rock";
  const discoveryRequest = await fetch(
    `${process.env.NEXT_PUBLIC_HOST_NAME}/api/discovery?type=${seedType}&value=${encodeURIComponent(seedValue)}`,
    {
      next: { revalidate: 60 },
    },
  );
  const discovery = (await discoveryRequest.json()) as DiscoveryResponse;
  const centerNode = discovery.nodes.find((node) => node.id === discovery.center);
  const artistNodes = filterNodesByType(discovery.nodes, "artist", discovery.center);
  const albumNodes = filterNodesByType(discovery.nodes, "album", discovery.center);
  const tagNodes = filterNodesByType(discovery.nodes, "tag", discovery.center);

  return (
    <section className="home-page w-full">
      <DiscoveryLogger discovery={discovery} />
      <h1>Discovery</h1>
      <form className="mt-4 flex flex-col gap-3 md:flex-row md:items-end" action="/home" method="GET">
        <label className="flex flex-col">
          <span>Type</span>
          <select name="type" defaultValue={seedType} className="rounded border px-3 py-2">
            <option value="tag">Genre</option>
            <option value="artist">Artist</option>
            <option value="album">Album</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span>Seed</span>
          <input
            name="value"
            defaultValue={seedValue}
            className="rounded border px-3 py-2"
            placeholder={
              seedType === "artist"
                ? "Radiohead"
                : seedType === "album"
                  ? "OK Computer"
                  : "rock"
            }
          />
        </label>

        <button type="submit" className="rounded border px-4 py-2">
          Explore
        </button>
      </form>

      <p className="mt-4">Seed: {discovery.seed.type} / {discovery.seed.value}</p>

      <section className="mt-6">
        <h2>Center</h2>
        <p>
          {centerNode?.label ?? "Unknown"}
          {centerNode?.sublabel ? ` (${centerNode.sublabel})` : ""}
        </p>
      </section>

      <section className="mt-8">
        <h2>Artists</h2>
        {renderNodeList(artistNodes)}
      </section>

      <section className="mt-8">
        <h2>Albums</h2>
        {renderNodeList(albumNodes)}
      </section>

      <section className="mt-8">
        <h2>Tags</h2>
        {renderNodeList(tagNodes)}
      </section>
    </section>
  );
}
