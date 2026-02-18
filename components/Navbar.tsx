"use client";

import { Search, Bell, User, Menu } from "lucide-react";

export default function Navbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  return (
    <header className="bg-white/50 backdrop-blur-sm border-b border-gray-100 h-16 md:h-20 px-3 md:px-6 lg:px-8 flex items-center gap-2 md:gap-4 sticky top-0 z-40">
      
      {/* Hamburger Menu - mobile only, on left */}
      <button
        onClick={onMenuToggle}
        className="md:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors shrink-0"
      >
        <Menu size={24} />
      </button>

      {/* 1. Search Bar */}
      <div className="relative flex-1 md:max-w-xs lg:max-w-sm xl:w-96 md:flex-none">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search" 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        />
      </div>

      {/* 2. Right Actions */}
      <div className="flex items-center gap-2 md:gap-4 lg:gap-6 shrink-0 md:ml-auto">
        
        {/* Notification Bell */}
        <button className="relative text-primary hover:bg-blue-50 p-2 rounded-full transition-colors shrink-0">
          <Bell size={20} className="md:w-6 md:h-6" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-4 lg:pl-6 border-l border-gray-200">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden shrink-0">
             {/* Placeholder Avatar */}
             <User size={20} className="md:w-6 md:h-6" /> 
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-none">John Doe</p>
            <p className="text-xs text-gray-500 mt-1">johndoe@gmail.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}