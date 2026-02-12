import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar"; // Sidebar Import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SocialDesk",
  description: "Social Media Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* bg-background here to set the main app color */}
      <body className={`${inter.className} flex bg-background text-gray-900`}>
        {/* Sidebar stays fixed on the left */}
        <Sidebar />

        {/* The Main Content area sits next to it.
            ml-64 creates space so the content isn't hidden behind the sidebar. */}
        <main className="flex-1 ml-64 p-8 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}