import { Params } from "next/dist/shared/lib/router/utils/route-matcher"

export async function GET(request: Request, context: { params: Params}) {
  const  url = `${process.env.API_URL}/2.0/?method=album.getinfo&artist=${context.params.artist}&album=${context.params.album}&api_key=${process.env.API_KEY}&format=json`
  return await fetch(url)
}