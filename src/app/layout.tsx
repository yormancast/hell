import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HeaderMain from "./ui/header/header";
import Footer from "./ui/footer/footer";


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
        <main className="flex flex-col items-center justify-between">
          <HeaderMain />
          <section className="content w-full px-12">
            {children}
          </section>
          <Footer />
        </main>
      </body>
    </html>
  );
}
