"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/Navbar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/logout";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {!isAuthPage && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      {/* The main content area shifts right (ml-64) on desktop */}
      <main className={`flex-1 min-h-screen bg-[#F3F6F8] transition-all overflow-x-hidden ${!isAuthPage ? "md:ml-64" : ""}`}>
        
        {/* Navbar sits inside the main area so it aligns with content */}
        {!isAuthPage && <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />}
        
        <div className="p-3 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </>
  );
}