"use client";

import Link from "next/link";
import Image from "next/image"; 
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  CalendarClock, 
  BarChart3, 
  Link as LinkIcon, 
  FileText, 
  X,
  Users
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if the logged-in user has the admin role
    const role = Cookies.get("user-role");
    if (role === "admin") {
      setIsAdmin(true);
    }
  }, []);

  // --- NEW: Cleaner conditional menu logic ---
  const allMenuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, reqAdmin: false },
    { name: "Scheduler", href: "/schedule", icon: CalendarClock, reqAdmin: false },
    { name: "Analytics", href: "/analytics", icon: BarChart3, reqAdmin: false },
    { name: "Accounts", href: "/accounts", icon: LinkIcon, reqAdmin: true }, // Accounts restricted
    { name: "Posts", href: "/posts", icon: FileText, reqAdmin: false },
    { name: "Management", href: "/management", icon: Users, reqAdmin: true }, // Management restricted
  ];

  // Filter the list: Only show items where reqAdmin is false, OR if the user is an admin
  const menuItems = allMenuItems.filter(item => !item.reqAdmin || isAdmin);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-64 bg-white h-screen fixed left-0 top-0 flex flex-col z-50 border-r border-gray-100 font-sans transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } md:translate-x-0 md:shadow-none`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg md:hidden z-50"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col px-6 pt-8 pb-4">
          <div className="relative w-full h-20"> 
              <Image 
                src="/logo-v2.png" 
                alt="SocialDesk" 
                fill
                sizes="200px"
                className="object-contain object-left" 
                priority
              />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/30" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon 
                  size={20} 
                  className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} 
                  strokeWidth={2}
                />
                <span className={`text-sm font-medium ${isActive ? "font-semibold" : ""}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}