import { Params } from "next/dist/shared/lib/router/utils/route-matcher"

export async function GET(request: Request, context: { params: Params}) {
  const country = context?.params?.country || "chile";
  const  url = `${process.env.API_URL}/2.0/?method=chart.gettopartists&api_key=${process.env.API_KEY}&format=json&country=${country}`
  return await fetch(url)
}