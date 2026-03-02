"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  UserCircle2, 
  Filter, 
  Users, 
  UserCheck, 
  UserMinus, 
  ShieldCheck,
  X // Added X icon for the modal
} from "lucide-react";

export default function ManagementPage() {
  
  // BACKEND NOTE: This mock data should be fetched from the database via a GET request.
  const [users, setUsers] = useState([
    { id: "1", name: "Admin 1", email: "admin1.egetinzz@gmail.com", role: "Admin", status: "Active", lastActive: "1 minute ago" },
    { id: "2", name: "User 1", email: "user1.egetinzz@gmail.com", role: "User", status: "Active", lastActive: "2 hours ago" },
    { id: "3", name: "User 2", email: "user2.egetinzz@gmail.com", role: "User", status: "Inactive", lastActive: "30 days ago" },
    { id: "4", name: "Sarah Connor", email: "s.connor@gmail.com", role: "Admin", status: "Inactive", lastActive: "5 days ago" },
    { id: "5", name: "John Smith", email: "john.smith@yahoo.com", role: "User", status: "Active", lastActive: "10 mins ago" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All"); 
  const [statusFilter, setStatusFilter] = useState("All"); 
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // --- NEW: Add User Modal State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "User" });

  // BACKEND NOTE: Delete handler. Implement the DELETE API call here.
  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  // --- NEW: Add User Handler ---
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // BACKEND NOTE: Implement POST request here to save the new user to the database.
    // Ensure the password is encrypted (e.g., bcrypt) on the backend before saving!
    
    // Mocking a successful database save:
    const mockNewId = (users.length + 10).toString();
    const createdUser = {
      id: mockNewId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "Active", // Default to Active when created
      lastActive: "Just now"
    };

    // Add to the top of the list
    setUsers([createdUser, ...users]);
    
    // Reset form and close modal
    setNewUser({ name: "", email: "", password: "", role: "User" });
    setIsAddModalOpen(false);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus = statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "Active").length;
  const inactiveUsers = users.filter(u => u.status === "Inactive").length;
  const adminUsers = users.filter(u => u.role === "Admin").length;

  return (
    <div className="flex flex-col gap-6 overflow-x-hidden pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Manage and monitor all user accounts.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#274C77] p-5 rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <p className="text-sm font-bold text-white z-10">Total Users</p>
          <h2 className="text-4xl font-bold text-white mt-2 z-10">{totalUsers}</h2>
          <Users size={40} className="absolute bottom-4 right-4 text-white/20 z-0" />
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex flex-col justify-between relative">
          <p className="text-sm font-bold text-[#274C77]">Active</p>
          <h2 className="text-4xl font-bold text-[#274C77] mt-2">{activeUsers}</h2>
          <UserCheck size={32} className="absolute bottom-5 right-5 text-blue-500" />
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex flex-col justify-between relative">
          <p className="text-sm font-bold text-[#274C77]">Inactive</p>
          <h2 className="text-4xl font-bold text-[#274C77] mt-2">{inactiveUsers}</h2>
          <UserMinus size={32} className="absolute bottom-5 right-5 text-blue-500" />
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex flex-col justify-between relative">
          <p className="text-sm font-bold text-[#274C77]">Admins</p>
          <h2 className="text-4xl font-bold text-[#274C77] mt-2">{adminUsers}</h2>
          <ShieldCheck size={32} className="absolute bottom-5 right-5 text-blue-500" />
        </div>
      </div>
      
      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm font-medium"
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 bg-white border text-sm rounded-lg font-medium transition-colors shadow-sm shrink-0 ${
                isFilterMenuOpen || roleFilter !== "All" || statusFilter !== "All" 
                  ? "border-primary text-primary bg-blue-50" 
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
               <Filter size={16} /> Filter 
               {(roleFilter !== "All" || statusFilter !== "All") && (
                 <span className="flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] rounded-full ml-1">
                   {(roleFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0)}
                 </span>
               )}
               <ChevronDown size={14} className={`ml-1 transition-transform ${isFilterMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isFilterMenuOpen && (
              <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-4 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Role</label>
                  <select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                {(roleFilter !== "All" || statusFilter !== "All") && (
                  <button 
                    onClick={() => { setRoleFilter("All"); setStatusFilter("All"); }}
                    className="text-xs text-red-500 font-bold hover:underline mt-1 text-center"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- NEW: Trigger Modal Button --- */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#A3CEF1] text-[#274C77] text-sm rounded-lg font-bold hover:bg-[#8ebfe6] transition-colors shadow-sm shrink-0"
        >
           <Plus size={18} /> Add User
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-hidden mt-2">
        <div className="hidden md:grid md:grid-cols-[3fr_1.5fr_1.5fr_2fr_1fr] bg-[#274C77] text-white text-xs font-bold uppercase tracking-wider py-3 px-6">
           <div>User</div>
           <div>Role</div>
           <div>Status</div>
           <div>Last Active</div>
           <div className="text-center">Actions</div>
        </div>

        <div className="flex flex-col">
          {filteredUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-1 md:grid-cols-[3fr_1.5fr_1.5fr_2fr_1fr] gap-3 md:gap-4 p-4 md:px-6 md:py-4 items-center border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#274C77] flex items-center justify-center shrink-0 text-white">
                     <UserCircle2 size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-tight truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
              </div>
              <div className="flex items-center pl-13 md:pl-0">
                  <span className={`text-xs font-bold px-4 py-1.5 rounded-full ${user.role === "Admin" ? "bg-[#274C77] text-white" : "bg-[#A3CEF1] text-[#274C77]"}`}>
                     {user.role}
                  </span>
              </div>
              <div className="flex items-center gap-2 pl-13 md:pl-0 text-sm font-medium text-gray-800">
                  <span className={`w-2.5 h-2.5 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-red-500"}`}></span> 
                  {user.status}
              </div>
              <div className="flex items-center pl-13 md:pl-0 text-sm text-gray-600 font-medium">
                  {user.lastActive}
              </div>
              <div className="flex items-center justify-end md:justify-center pl-13 md:pl-0 pt-2 md:pt-0">
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete User"
                  >
                     <MoreVertical size={18} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================= */}
      {/* NEW: ADD USER MODAL                       */}
      {/* ========================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#274C77]">Add New User</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddUser} className="p-6 flex flex-col gap-4">
              
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Jane Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Temporary Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Account Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer"
                >
                  <option value="User">Standard User</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold bg-[#274C77] text-white hover:bg-blue-900 rounded-lg transition-colors shadow-sm"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function ChevronDown(props: any) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}