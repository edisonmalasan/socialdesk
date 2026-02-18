"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/Navbar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/logout";

  return (
    <>
      {!isAuthPage && <Sidebar />}

      {/* The main content area shifts right (ml-64) */}
      <main className={`flex-1 min-h-screen bg-[#F3F6F8] transition-all ${!isAuthPage ? "ml-64" : ""}`}>
        
        {/* Navbar sits inside the main area so it aligns with content */}
        {!isAuthPage && <Navbar />}
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </>
  );
}