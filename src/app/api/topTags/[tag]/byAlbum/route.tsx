import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

export async function GET(request:Request, context: { params: Params}){
  const  url = `${process.env.API_URL}/2.0/?method=tag.gettopalbums&tag=${context.params.tag}&api_key=${process.env.API_KEY}&format=json&limit=15`
  const res = await fetch(url); 
  const response = await res.json(); 
  
  return Response.json({ response });
}