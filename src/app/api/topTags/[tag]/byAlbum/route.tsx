import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { getTopAlbumsByTag } from "@/app/libs/lastfm";

export async function GET(request:Request, context: { params: Params}){
  const albums = await getTopAlbumsByTag(context.params.tag);

  return Response.json({ albums });
}
