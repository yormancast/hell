import Link from "next/link";

export default function HeaderMain() {
  return(
    <div className="header-main w-screen flex">
      <Link className="flex grow flex-start grow p-3" href={"/home"}>Logo</Link>
    </div>    
  )
}