"use client";

import Link from "next/link";
import Image from "next/image"; 
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarClock, 
  BarChart3, 
  Link as LinkIcon, 
  FileText, 
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Scheduler", href: "/schedule", icon: CalendarClock },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Accounts", href: "/accounts", icon: LinkIcon },
    { name: "Posts", href: "/posts", icon: FileText },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-64 bg-white h-screen fixed left-0 top-0 flex flex-col z-50 border-r border-gray-100 font-sans transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-6 right-4 text-gray-400 hover:text-gray-600 md:hidden"
        >
          <X size={24} />
        </button>

        {/* 1. Logo Section */}
        {/* Increased padding-top to give it headroom */}
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

      {/* 2. Navigation Menu */}
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

      {/* 3. Log Out */}
      <div className="p-4 mb-4">
        <Link 
          href="/logout"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Log out</span>
        </Link>
      </div>
      </aside>
    </>
  );
}