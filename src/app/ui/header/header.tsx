import Link from "next/link";
import NavLinks from "./navLinks";

export default function HeaderMain() {
  return(
    <div className="header-main w-screen flex">
      <Link className="flex grow flex-start grow p-3" href={"/home"}>Logo</Link>
      <NavLinks/>
    </div>    
  )
}