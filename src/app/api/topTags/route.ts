import { getTopTags } from "@/app/libs/lastfm";

export async function GET() {
  const tags = await getTopTags();

  return Response.json({ tags });
}
