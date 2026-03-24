
import { headers } from "next/headers";
import ForceGraph3DClient from "../components/3dMapRender/ForceGraph3DClient";
import { buildGraphData } from "@/app/libs/graph";
import type { DiscoveryResponse } from "@/types/music";

type HomePageProps = {
  searchParams?: {
    type?: string;
    value?: string;
  };
};

function getBaseUrl() {
  const requestHeaders = headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (!host) {
    return process.env.NEXT_PUBLIC_HOST_NAME ?? "http://localhost:3000";
  }

  return `${protocol}://${host}`;
}

export default async function Home({ searchParams }: HomePageProps) {
  const seedType = searchParams?.type;
  const submittedValue = searchParams?.value?.trim();
  const hasInteracted = typeof searchParams?.value === "string";

  if (!hasInteracted) {
    return (
      <section className="home-page w-full py-12">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <h1 className="text-3xl font-semibold">Discovery</h1>
          <p className="text-sm text-[#b8b1a5]">
            Start with a Genre, Artist, or Album and we&apos;ll build the map from there.
          </p>
          <form action="/home" method="get" className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Seed type</span>
              <select
                name="type"
                defaultValue="tag"
                className="rounded-md border border-[#2b2b2b] bg-[#111111] px-3 py-2 text-[#f2eee6]"
              >
                <option value="tag">Genre</option>
                <option value="artist">Artist</option>
                <option value="album">Album</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <input
                type="text"
                name="value"
                defaultValue="rock"
                placeholder="rock"
                className="rounded-md border border-[#2b2b2b] bg-[#111111] px-3 py-2 text-[#f2eee6] placeholder:text-[#7e786f]"
              />
            </label>
            <button
              type="submit"
              className="w-fit rounded-md border border-[#2b2b2b] bg-[#f2eee6] px-4 py-2 text-sm font-medium text-[#050505]"
            >
              Explore!
            </button>
          </form>
        </div>
      </section>
    );
  }

  const seedValue = submittedValue || "rock";
  const discoveryRequest = await fetch(
    `${getBaseUrl()}/api/discovery?type=${seedType}&value=${encodeURIComponent(seedValue)}`,
    {
      next: { revalidate: 60 },
    },
  );

  if (!discoveryRequest.ok) {
    throw new Error("Failed to load discovery data.");
  }

  const discovery = (await discoveryRequest.json()) as DiscoveryResponse;
  const graphData = buildGraphData(discovery);

  return (
    <section className="home-page w-full py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Discovery</h1>
          <p className="text-sm text-[#b8b1a5]">
            Showing {discovery.seed.type}: {discovery.seed.value}
          </p>
        </div>
        <form action="/home" method="get" className="flex items-center gap-3">
          <input type="hidden" name="type" value={seedType} />
          <input
            type="text"
            name="value"
            defaultValue={seedValue}
            className="rounded-md border border-[#2b2b2b] bg-[#111111] px-3 py-2 text-[#f2eee6] placeholder:text-[#7e786f]"
          />
          <button
            type="submit"
            className="rounded-md border border-[#2b2b2b] bg-[#f2eee6] px-4 py-2 text-sm font-medium text-[#050505]"
          >
            Refresh map
          </button>
        </form>
      </div>
      <ForceGraph3DClient graphData={graphData} />
    </section>
  );
}
