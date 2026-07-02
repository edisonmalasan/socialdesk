import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper"; // Import wrapper

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
      <body className={`${inter.className} flex bg-background text-gray-900`}>
        {/* Pass children to the wrapper so it controls the layout */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}