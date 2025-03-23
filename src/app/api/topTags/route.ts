
export async function GET(request: Request) {
  const  url = `${process.env.API_URL}/2.0/?method=chart.gettoptags&api_key=${process.env.API_KEY}&format=json&limit=15`
  const res = await fetch(url); 
  const response = await res.json(); 
  
  return Response.json({ response });
}