"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/Navbar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Automatically close the mobile sidebar when a user clicks a link and navigates
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const isAuthPage = pathname === "/login" || pathname === "/logout" || pathname === "/register";

  return (
    <>
      {/* Pass the state and the closer function to the Sidebar */}
      {!isAuthPage && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

      {/* MOBILE FIX: Changed "ml-64" to "md:ml-64". 
          This means on mobile it takes full width, on desktop it leaves room for the sidebar. */}
      <main className={`flex-1 min-h-screen transition-all ${!isAuthPage ? "md:ml-64" : ""}`}>
        
        {/* Pass the opener function to the Navbar */}
        {!isAuthPage && <Navbar onMenuClick={() => setIsSidebarOpen(true)} />}
        
        <div className={!isAuthPage ? "p-4 md:p-8" : ""}>
          {children}
        </div>
      </main>
    </>
  );
}