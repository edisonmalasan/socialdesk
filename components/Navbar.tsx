"use client";

import { Search, Bell, User, Menu } from "lucide-react"; // Added Menu icon

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="bg-white/50 backdrop-blur-sm border-b border-gray-100 h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      
      {/* 1. Left Side: Hamburger (Mobile) + Search (Desktop) */}
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        
        {/* The Hamburger Button */}
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="relative w-full max-w-xs md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* 2. Right Actions */}
      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        
        <button className="relative text-primary hover:bg-blue-50 p-2 rounded-full transition-colors">
          <Bell size={24} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden shrink-0">
             <User size={24} /> 
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-gray-900 leading-none">John Doe</p>
            <p className="text-xs text-gray-500 mt-1">johndoe@gmail.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}