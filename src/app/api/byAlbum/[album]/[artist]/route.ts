import { Params } from "next/dist/shared/lib/router/utils/route-matcher"
import { getAlbumDetails } from "@/app/libs/lastfm";

export async function GET(request: Request, context: { params: Params}) {
  const album = await getAlbumDetails(context.params.artist, context.params.album);

  return Response.json({ album });
}
