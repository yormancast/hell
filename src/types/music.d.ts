export type MusicImage = {
  url: string;
  size: string;
};

export type TagSummary = {
  id: string;
  name: string;
  url: string | null;
  reach: number | null;
  total: number | null;
};

export type ArtistSummary = {
  id: string;
  name: string;
  url: string | null;
  listeners: number | null;
  playcount: number | null;
  imageUrl: string | null;
};

export type AlbumSummary = {
  id: string;
  name: string;
  artistName: string;
  url: string | null;
  playcount: number | null;
  imageUrl: string | null;
};

export type ArtistDetails = ArtistSummary & {
  bio: string | null;
  tags: TagSummary[];
  similarArtists: ArtistSummary[];
};

export type AlbumDetails = AlbumSummary & {
  tags: TagSummary[];
  tracks: {
    id: string;
    name: string;
    duration: number | null;
    rank: number | null;
  }[];
};

export type DiscoverySeedType = "artist" | "tag" | "album";

export type DiscoveryNodeType = "artist" | "album" | "tag";

export type DiscoveryNode = {
  id: string;
  type: DiscoveryNodeType;
  label: string;
  sublabel: string | null;
  url: string | null;
  imageUrl: string | null;
};

export type DiscoveryEdge = {
  id: string;
  source: string;
  sourceType: DiscoveryNodeType;
  sourceValue: string;
  target: string;
  targetType: DiscoveryNodeType;
  targetValue: string;
  relationship: string;
};

export type DiscoveryResponse = {
  seed: {
    type: DiscoverySeedType;
    value: string;
  };
  center: string;
  nodes: DiscoveryNode[];
  edges: DiscoveryEdge[];
};
