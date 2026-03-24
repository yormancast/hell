import {
  getArtistDetails,
  getAlbumDetails,
  getTopAlbumsByArtist,
  getTopAlbumsByTag,
  getTopArtistsByTag,
  normalizeTag,
  searchAlbumByName,
} from "@/app/libs/lastfm";
import {
  AlbumSummary,
  ArtistSummary,
  DiscoveryEdge,
  DiscoveryNode,
  DiscoveryNodeType,
  DiscoveryResponse,
  DiscoverySeedType,
  TagSummary,
} from "@/types/music";

function createDiscoveryNodeId(type: DiscoveryNodeType, value: string) {
  return `${type}:${value.trim().toLowerCase().replace(/\s+/g, "-")}`;
}

const ARTIST_LIMIT = 50;
const ALBUM_LIMIT = 50;

function createEdge(
  source: string,
  sourceType: DiscoveryNodeType,
  sourceValue: string,
  target: string,
  targetType: DiscoveryNodeType,
  targetValue: string,
  relationship: string,
): DiscoveryEdge {
  return {
    id: `${source}:${relationship}:${target}`,
    source,
    sourceType,
    sourceValue,
    target,
    targetType,
    targetValue,
    relationship,
  };
}

function artistToNode(artist: ArtistSummary): DiscoveryNode {
  return {
    id: artist.id,
    type: "artist",
    label: artist.name,
    sublabel: artist.listeners ? `${artist.listeners.toLocaleString()} listeners` : null,
    url: artist.url,
    imageUrl: artist.imageUrl,
  };
}

function albumToNode(album: AlbumSummary): DiscoveryNode {
  return {
    id: album.id,
    type: "album",
    label: album.name,
    sublabel: album.artistName,
    url: album.url,
    imageUrl: album.imageUrl,
  };
}

function tagToNode(tag: TagSummary): DiscoveryNode {
  return {
    id: tag.id,
    type: "tag",
    label: tag.name,
    sublabel: tag.reach ? `${tag.reach.toLocaleString()} reach` : null,
    url: tag.url,
    imageUrl: null,
  };
}

function uniqueNodes(nodes: DiscoveryNode[]) {
  return Array.from(new Map(nodes.map((node) => [node.id, node])).values());
}

function uniqueEdges(edges: DiscoveryEdge[]) {
  return Array.from(new Map(edges.map((edge) => [edge.id, edge])).values());
}

async function buildArtistDiscovery(value: string): Promise<DiscoveryResponse> {
  const [artist, albums] = await Promise.all([
    getArtistDetails(value),
    getTopAlbumsByArtist(value, ALBUM_LIMIT),
  ]);

  const center = artist.id;
  const artistNode = artistToNode(artist);
  const similarArtistNodes = artist.similarArtists.map(artistToNode);
  const albumNodes = albums.map(albumToNode);
  const tagNodes = artist.tags.map(tagToNode);

  const edges = uniqueEdges([
    ...artist.similarArtists.map((similarArtist) =>
      createEdge(
        center,
        "artist",
        artist.name,
        similarArtist.id,
        "artist",
        similarArtist.name,
        "similar-artist",
      ),
    ),
    ...albums.map((album) =>
      createEdge(center, "artist", artist.name, album.id, "album", album.name, "top-album"),
    ),
    ...artist.tags.map((tag) =>
      createEdge(center, "artist", artist.name, tag.id, "tag", tag.name, "tag"),
    ),
  ]);

  return {
    seed: {
      type: "artist",
      value,
    },
    center,
    nodes: uniqueNodes([artistNode, ...similarArtistNodes, ...albumNodes, ...tagNodes]),
    edges,
  };
}

async function buildTagDiscovery(value: string): Promise<DiscoveryResponse> {
  const [artists, albums] = await Promise.all([
    getTopArtistsByTag(value, ARTIST_LIMIT),
    getTopAlbumsByTag(value, ALBUM_LIMIT),
  ]);

  const centerTag = normalizeTag({ name: value });
  const center = centerTag.id;
  const tagNode = tagToNode(centerTag);
  const artistNodes = artists.map(artistToNode);
  const albumNodes = albums.map(albumToNode);

  const edges = uniqueEdges([
    ...artists.map((artist) =>
      createEdge(center, "tag", centerTag.name, artist.id, "artist", artist.name, "top-artist"),
    ),
    ...albums.map((album) =>
      createEdge(center, "tag", centerTag.name, album.id, "album", album.name, "top-album"),
    ),
    ...albums.map((album) =>
      createEdge(
        album.id,
        "album",
        album.name,
        createDiscoveryNodeId("artist", album.artistName),
        "artist",
        album.artistName,
        "by-artist",
      ),
    ),
  ]);

  const albumArtistNodes = albums.map((album) => ({
    id: createDiscoveryNodeId("artist", album.artistName),
    type: "artist" as const,
    label: album.artistName,
    sublabel: null,
    url: null,
    imageUrl: null,
  }));

  return {
    seed: {
      type: "tag",
      value,
    },
    center,
    nodes: uniqueNodes([tagNode, ...artistNodes, ...albumNodes, ...albumArtistNodes]),
    edges,
  };
}

async function buildAlbumDiscovery(value: string): Promise<DiscoveryResponse> {
  const matchedAlbum = await searchAlbumByName(value);

  if (!matchedAlbum) {
    return {
      seed: {
        type: "album",
        value,
      },
      center: createDiscoveryNodeId("album", value),
      nodes: [
        {
          id: createDiscoveryNodeId("album", value),
          type: "album",
          label: value,
          sublabel: null,
          url: null,
          imageUrl: null,
        },
      ],
      edges: [],
    };
  }

  const [album, artist, artistAlbums] = await Promise.all([
    getAlbumDetails(matchedAlbum.artistName, matchedAlbum.name),
    getArtistDetails(matchedAlbum.artistName),
    getTopAlbumsByArtist(matchedAlbum.artistName, ALBUM_LIMIT),
  ]);

  const center = album.id;
  const albumNode = albumToNode(album);
  const artistNode = artistToNode(artist);
  const tagNodes = album.tags.map(tagToNode);
  const siblingAlbumNodes = artistAlbums
    .filter((artistAlbum) => artistAlbum.id !== album.id)
    .map(albumToNode);
  const similarArtistNodes = artist.similarArtists.map(artistToNode);

  const edges = uniqueEdges([
    createEdge(center, "album", album.name, artist.id, "artist", artist.name, "by-artist"),
    ...album.tags.map((tag) =>
      createEdge(center, "album", album.name, tag.id, "tag", tag.name, "tag"),
    ),
    ...artistAlbums
      .filter((artistAlbum) => artistAlbum.id !== album.id)
      .map((artistAlbum) =>
        createEdge(
          artist.id,
          "artist",
          artist.name,
          artistAlbum.id,
          "album",
          artistAlbum.name,
          "top-album",
        ),
      ),
    ...artist.similarArtists.map((similarArtist) =>
      createEdge(artist.id, "artist", artist.name, similarArtist.id, "artist", similarArtist.name, "similar-artist"),
    ),
  ]);

  return {
    seed: {
      type: "album",
      value,
    },
    center,
    nodes: uniqueNodes([
      albumNode,
      artistNode,
      ...tagNodes,
      ...siblingAlbumNodes,
      ...similarArtistNodes,
    ]),
    edges,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as DiscoverySeedType | null;
  const value = searchParams.get("value")?.trim();

  if (!type || !value) {
    return Response.json(
      { error: "Expected query params: type and value." },
      { status: 400 },
    );
  }

  if (type === "artist") {
    const discovery = await buildArtistDiscovery(value);
    return Response.json(discovery);
  }

  if (type === "tag") {
    const discovery = await buildTagDiscovery(value);
    return Response.json(discovery);
  }

  if (type === "album") {
    const discovery = await buildAlbumDiscovery(value);
    return Response.json(discovery);
  }

  return Response.json(
    { error: "Unsupported discovery type. Use artist, album or tag." },
    { status: 400 },
  );
}
