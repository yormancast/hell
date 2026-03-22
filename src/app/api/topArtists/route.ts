import { getTopArtists } from "@/app/libs/lastfm";

export async function GET() {
  const artists = await getTopArtists();

  return Response.json({ artists });
}
