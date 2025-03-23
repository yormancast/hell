export default async function Page({params}:{params:{name:string}}){
  const getTopAlbums = await fetch(`${process.env.NEXT_PUBLIC_HOST_NAME}/api/topTags/${params.name}/byAlbum`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });
  const res = await getTopAlbums.json();
  const albumsByTag = res.response.albums.album;

  return (
    <section className={`${params.name}-page`}>
      <h2>{params.name}</h2>
      <ul className="list-disc">
        {albumsByTag.map((album:any)=>{
          return(
            <li key={album.name}> {album.artist.name} - {album.name}</li>
          )
        })}
      </ul>
    </section>
  )
}