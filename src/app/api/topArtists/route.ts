
export async function GET(request: Request) {
  const  url = `${process.env.API_URL}/2.0/?method=chart.gettopartists&api_key=${process.env.API_KEY}&format=json`
  return await fetch(url)
}