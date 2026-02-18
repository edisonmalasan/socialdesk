"use client";

import { Search, Bell, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="bg-white/50 backdrop-blur-sm border-b border-gray-100 h-20 px-8 flex items-center justify-between sticky top-0 z-40">
      
      {/* 1. Search Bar */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search" 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        />
      </div>

      {/* 2. Right Actions */}
      <div className="flex items-center gap-6">
        
        {/* Notification Bell */}
        <button className="relative text-primary hover:bg-blue-50 p-2 rounded-full transition-colors">
          <Bell size={24} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
             {/* Placeholder Avatar */}
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