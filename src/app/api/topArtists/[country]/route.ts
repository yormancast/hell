import { Params } from "next/dist/shared/lib/router/utils/route-matcher"
import { getTopArtists } from "@/app/libs/lastfm";

export async function GET(request: Request, context: { params: Params}) {
  const country = context?.params?.country || "chile";
  const artists = await getTopArtists(country);

  return Response.json({ artists });
}
