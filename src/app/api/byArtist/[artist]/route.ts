import { Params } from "next/dist/shared/lib/router/utils/route-matcher"
import { getArtistDetails } from "@/app/libs/lastfm";

export async function GET(request: Request, context: { params: Params}) {
  const artist = await getArtistDetails(context.params.artist);

  return Response.json({ artist });
}
