import {
  AlbumDetails,
  AlbumSummary,
  ArtistDetails,
  ArtistSummary,
  MusicImage,
  TagSummary,
} from "@/types/music";
import type {
  LastFmAlbum,
  LastFmAlbumSearchMatch,
  LastFmArtist,
  LastFmImage,
  LastFmTag,
  LastFmTrack,
} from "@/types/lastfm";

function createId(parts: Array<string | undefined>): string {
  return parts
    .filter(Boolean)
    .map((part) => part!.trim().toLowerCase().replace(/\s+/g, "-"))
    .join(":");
}

function normalizeImages(images: LastFmImage[] | undefined): MusicImage[] {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => ({
      url: image["#text"] ?? "",
      size: image.size ?? "unknown",
    }))
    .filter((image) => image.url.length > 0);
}

function getPrimaryImageUrl(images: LastFmImage[] | undefined): string | null {
  const normalized = normalizeImages(images);
  return normalized.at(-1)?.url ?? normalized[0]?.url ?? null;
}

export async function fetchLastFm(method: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams({
    method,
    api_key: process.env.API_KEY ?? "",
    format: "json",
    ...params,
  });

  const url = `${process.env.API_URL}/2.0/?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Last.fm request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function normalizeTag(tag: LastFmTag): TagSummary {
  const name = tag.name ?? "unknown";

  return {
    id: createId(["tag", name]),
    name,
    url: tag.url ?? null,
    reach: tag.reach !== undefined && tag.reach !== "" ? Number(tag.reach) : null,
    total:
      tag.taggings !== undefined && tag.taggings !== ""
        ? Number(tag.taggings)
        : tag.count !== undefined && tag.count !== ""
          ? Number(tag.count)
          : null,
  };
}

export function normalizeArtist(artist: LastFmArtist): ArtistSummary {
  const name = artist.name ?? "unknown";

  return {
    id: createId(["artist", name]),
    name,
    url: artist.url ?? null,
    listeners:
      artist.listeners !== undefined && artist.listeners !== ""
        ? Number(artist.listeners)
        : null,
    playcount:
      artist.playcount !== undefined && artist.playcount !== ""
        ? Number(artist.playcount)
        : null,
    imageUrl: getPrimaryImageUrl(artist.image),
  };
}

export function normalizeAlbum(album: LastFmAlbum): AlbumSummary {
  const artistName =
    typeof album.artist === "string" ? album.artist : album.artist?.name ?? "unknown";
  const name = album.name ?? "unknown";

  return {
    id: createId(["album", artistName, name]),
    name,
    artistName,
    url: album.url ?? null,
    playcount:
      album.playcount !== undefined && album.playcount !== ""
        ? Number(album.playcount)
        : null,
    imageUrl: getPrimaryImageUrl(album.image),
  };
}

export async function getTopTags(limit = 15): Promise<TagSummary[]> {
  const response = await fetchLastFm("chart.gettoptags", { limit: String(limit) });
  const tags = response.tags?.tag ?? [];

  return tags.map(normalizeTag);
}

export async function getTopArtists(country?: string): Promise<ArtistSummary[]> {
  const response = await fetchLastFm("chart.gettopartists", country ? { country } : {});
  const artists = response.artists?.artist ?? [];

  return artists.map(normalizeArtist);
}

export async function getTopArtistsByTag(tag: string, limit = 15): Promise<ArtistSummary[]> {
  const response = await fetchLastFm("tag.gettopartists", {
    tag,
    limit: String(limit),
  });
  const artists = response.topartists?.artist ?? [];

  return artists.map(normalizeArtist);
}

export async function getTopAlbumsByTag(tag: string, limit = 15): Promise<AlbumSummary[]> {
  const response = await fetchLastFm("tag.gettopalbums", {
    tag,
    limit: String(limit),
  });
  const albums = response.albums?.album ?? [];

  return albums.map(normalizeAlbum);
}

export async function getTopAlbumsByArtist(artist: string, limit = 10): Promise<AlbumSummary[]> {
  const response = await fetchLastFm("artist.gettopalbums", {
    artist,
    limit: String(limit),
  });
  const albums = response.topalbums?.album ?? [];

  return albums.map(normalizeAlbum);
}

export async function searchAlbumByName(album: string, limit = 1): Promise<AlbumSummary | null> {
  const response = await fetchLastFm("album.search", {
    album,
    limit: String(limit),
  });
  const matches = response.results?.albummatches?.album ?? [];
  const firstMatch = Array.isArray(matches) ? matches[0] : matches;

  if (!firstMatch) {
    return null;
  }

  return normalizeAlbum(firstMatch as LastFmAlbumSearchMatch);
}

export async function getArtistDetails(artist: string): Promise<ArtistDetails> {
  const response = await fetchLastFm("artist.getinfo", { artist });
  const data = response.artist ?? {};

  return {
    ...normalizeArtist(data),
    bio: data.bio?.summary ?? null,
    tags: (data.tags?.tag ?? []).map(normalizeTag),
    similarArtists: (data.similar?.artist ?? []).map(normalizeArtist),
  };
}

export async function getAlbumDetails(artist: string, album: string): Promise<AlbumDetails> {
  const response = await fetchLastFm("album.getinfo", { artist, album });
  const data = response.album ?? {};
  const tracks = Array.isArray(data.tracks?.track)
    ? data.tracks.track
    : data.tracks?.track
      ? [data.tracks.track]
      : [];

  return {
    ...normalizeAlbum(data),
    tags: (data.tags?.tag ?? []).map(normalizeTag),
    tracks: tracks.map((track: LastFmTrack) => ({
      id: createId(["track", artist, track.name]),
      name: track.name ?? "unknown",
      duration:
        track.duration !== undefined && track.duration !== ""
          ? Number(track.duration)
          : null,
      rank:
        track["@attr"]?.rank !== undefined && track["@attr"]?.rank !== ""
          ? Number(track["@attr"]?.rank)
          : null,
    })),
  };
}
