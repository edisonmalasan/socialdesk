"use client";

import { useState } from "react";
import { Search, Plus, MoreHorizontal, Trash2, UserCog, UserCircle2, Mail, CalendarDays } from "lucide-react";

export default function ManagementPage() {
  
  // BACKEND NOTE: This mock data should be fetched from the database via a GET request
  const [users, setUsers] = useState([
    { id: "1", name: "John Doe", email: "johndoe@gmail.com", role: "user", joinedDate: "Feb 14, 2026", status: "Active" },
    { id: "2", name: "Sarah Jane", email: "sarahjane@hotmail.com", role: "admin", joinedDate: "Feb 15, 2026", status: "Active" },
    { id: "3", name: "Robert Fox", email: "robertfox@gmail.com", role: "user", joinedDate: "Feb 16, 2026", status: "Offline" },
    { id: "4", name: "Emily Watson", email: "emily.watson@yahoo.com", role: "user", joinedDate: "Feb 17, 2026", status: "Active" },
    { id: "5", name: "Michael Chen", email: "m.chen@outlook.com", role: "user", joinedDate: "Feb 18, 2026", status: "Invited" },
  ]);

  const handleDeleteUser = (id: string) => {
    // BACKEND NOTE: Implement an API call (DELETE request) here to remove the user from the database.
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Add, manage, and delete website accounts</p>
        </div>
        
        {/* Actions Row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email" 
              // BACKEND NOTE: Add onChange handler here to filter the users list
              className="w-full sm:w-72 pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm rounded-full font-semibold hover:bg-blue-900 transition-colors shadow-md shadow-primary/20 shrink-0">
             <Plus size={18} /> Add New User
          </button>
        </div>
      </div>

      {/* Modern Table Layout (Optimized for Mobile & Desktop) */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 overflow-x-hidden">
        
        {/* Table Header (Hidden on Mobile) */}
        {/* BUG FIX: Changed commas to underscores in grid-cols */}
        <div className="hidden md:grid md:grid-cols-[3fr_2fr_2fr_2fr_1fr] gap-4 px-4 pb-4 border-b border-gray-100 font-bold text-gray-900 text-sm">
           <div>Name</div>
           <div>Email</div>
           <div>Role</div>
           <div>Joined Date</div>
           <div className="text-right pr-4">Action</div>
        </div>

        {/* User Rows */}
        <div className="flex flex-col">
          {users.map((user) => (
            <div 
              key={user.id} 
              
              className="grid grid-cols-1 md:grid-cols-[3fr_2fr_2fr_2fr_1fr] gap-3 md:gap-4 p-4 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-xl transition-colors group"
            >
              
              {/* Name */}
              <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${user.role === "admin" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-primary"}`}>
                     {user.role === "admin" ? <UserCog size={22} /> : <UserCircle2 size={22} />} 
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-none truncate">{user.name}</p>
                    <p className={`text-[11px] font-medium mt-1 leading-none inline-flex items-center gap-1.5 ${user.status === "Active" ? "text-green-600" : "text-gray-400"}`}>
                       <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-gray-300"}`}></span> 
                       {user.status}
                    </p>
                  </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2 text-sm text-gray-600 pl-12 md:pl-0 truncate">
                  <Mail size={16} className="text-gray-400 shrink-0 md:hidden" /> {user.email}
              </div>

              {/* Role */}
              <div className="flex items-center gap-2 pl-12 md:pl-0 text-sm capitalize font-medium text-gray-800">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${user.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
                     {user.role}
                  </span>
              </div>

              {/* Joined Date */}
              <div className="flex items-center gap-2 pl-12 md:pl-0 text-sm text-gray-500">
                  <CalendarDays size={16} className="text-gray-400 shrink-0 md:hidden" /> {user.joinedDate}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pl-12 md:pl-0 pt-2 md:pt-0">
                  <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                     <MoreHorizontal size={20} />
                  </button>
                  <button 
                     onClick={() => handleDeleteUser(user.id)}
                     className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                     title="Delete User"
                  >
                     <Trash2 size={20} />
                  </button>
              </div>

            </div>
          ))}
          
          {/* Empty State Fallback */}
          {users.length === 0 && (
             <div className="text-center py-12 text-gray-500">
                <UserCircle2 size={48} className="mx-auto text-gray-300 mb-3" />
                <p>No users found in the system.</p>
             </div>
          )}
        </div>
      </div>

    </div>
  );
}