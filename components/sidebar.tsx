"use client"; // Makes the "active" highlighting work

import Link from "next/link";
import { usePathname } from "next/navigation"; // Hook to check which page we are on
import { 
  LayoutDashboard, 
  CalendarClock, 
  BarChart3, 
  Link as LinkIcon, 
  FileText, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Scheduler", href: "/schedule", icon: CalendarClock },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Accounts", href: "/accounts", icon: LinkIcon },
    { name: "Posts", href: "/posts", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-primary text-white h-screen fixed left-0 top-0 flex flex-col z-50">
      
      {/* 1. Header Section */}
      <div className="p-6 mb-4">
        <h1 className="text-2xl font-bold tracking-wider">Social Desk</h1>
        <p className="text-xs text-gray-300 mt-1 opacity-80">Manage. Analyze. Grow.</p>
      </div>

      {/* 2. Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                isActive 
                  ? "bg-secondary text-white shadow-md" // Active Style (Lighter Blue)
                  : "text-gray-300 hover:bg-white/10 hover:text-white" // Inactive Style
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* 3. Bottom Section: Log Out & Profile */}
      <div className="p-4 border-t border-white/10">
        <Link 
          href="/logout"
          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors mb-4"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Log out</span>
        </Link>

        {/* User Profile Card */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0">
             {/* This div is the gray circle avatar placeholder */}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">John Doe</p>
            <p className="text-xs text-gray-400 truncate">johndoe@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}