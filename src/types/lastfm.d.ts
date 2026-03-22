export type LastFmImage = {
  "#text"?: string;
  size?: string;
};

export type LastFmTag = {
  name?: string;
  url?: string;
  reach?: string | number;
  taggings?: string | number;
  count?: string | number;
};

export type LastFmArtist = {
  name?: string;
  url?: string;
  listeners?: string | number;
  playcount?: string | number;
  image?: LastFmImage[];
};

export type LastFmAlbum = {
  name?: string;
  url?: string;
  playcount?: string | number;
  image?: LastFmImage[];
  artist?: string | { name?: string };
};

export type LastFmAlbumSearchMatch = {
  name?: string;
  url?: string;
  artist?: string;
  image?: LastFmImage[];
};

export type LastFmTrack = {
  name?: string;
  duration?: string | number;
  "@attr"?: {
    rank?: string | number;
  };
};
