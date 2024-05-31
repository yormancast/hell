import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HeaderMain from "./ui/header/header";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "It's dark and hell is hot",
  description: "read",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
          <HeaderMain />
          {children}
        </main>
      </body>
    </html>
  );
}
