'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx"; 

export default function NavLinks() {
  const path = usePathname();
  const links:any[] = [
    {name:"Home", href:"/home", icon: "home"},
    {name:"Top Artist", href:"/topArtist", icon: "mic"},
    {name:"Top Tracks", href:"/topTracks", icon: "music"}
  ]
  return (
    <>
      {links.map((link: any) => {
        return (
          <Link
          key={link.name}
          href={link.href}
          className={clsx(
            "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
            {"font-bold": path === link.href}
          )}>
          <p>{link.name}</p>
        </Link>
        )
      })}
    </>
  )
}