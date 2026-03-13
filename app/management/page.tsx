"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  X,
  Pencil,
  KeyRound,
  Ban,
  Trash2
} from "lucide-react";

export default function ManagementPage() {
  
  // BACKEND NOTE: This mock data should be fetched from the database via a GET request.
  const [users, setUsers] = useState([
    { id: "1", name: "Admin 1",      email: "admin1.egetinzz@gmail.com", role: "Admin", status: "Active",   lastActive: "1 minute ago",  business: "eGetinnz PH"  },
    { id: "2", name: "User 1",       email: "user1.egetinzz@gmail.com",  role: "User",  status: "Active",   lastActive: "2 hours ago",   business: "Fibei Travel" },
    { id: "3", name: "User 2",       email: "user2.egetinzz@gmail.com",  role: "User",  status: "Inactive", lastActive: "30 days ago",   business: "eGetinnz USA" },
    { id: "4", name: "Sarah Connor", email: "s.connor@gmail.com",        role: "Admin", status: "Inactive", lastActive: "5 days ago",    business: "Digitimmerse" },
    { id: "5", name: "John Smith",   email: "john.smith@yahoo.com",      role: "User",  status: "Active",   lastActive: "10 mins ago",  business: "eGetinnz PH"  },
  ]);

  const businesses = ["eGetinnz PH", "eGetinnz USA", "Fibei Travel", "Digitimmerse"];

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All"); 
  const [statusFilter, setStatusFilter] = useState("All");
  const [businessFilter, setBusinessFilter] = useState("All");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filterAlign, setFilterAlign] = useState<"left" | "right">("right");
  const [actionMenuAnchor, setActionMenuAnchor] = useState<{ id: string; top: number; right: number } | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setActionMenuAnchor(null);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "User" });

  const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false);
  const [editUserDetails, setEditUserDetails] = useState({ id: "", name: "", email: "", business: "" });

  const [isEditAccessModalOpen, setIsEditAccessModalOpen] = useState(false);
  const [editUserAccess, setEditUserAccess] = useState({ id: "", role: "" });

  // --- HANDLERS ---
  const handleDeleteUser = (id: string) => {
    // BACKEND NOTE: Implement DELETE /api/users/:id
    setUsers(users.filter(user => user.id !== id));
    setActionMenuAnchor(null); 
  };

  const handleDisableUser = (id: string) => {
    // BACKEND NOTE: Implement PATCH /api/users/:id/disable
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
    setActionMenuAnchor(null); 
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    // BACKEND NOTE: Implement POST request here to save the new user to the database.
    const mockNewId = (users.length + 10).toString();
    const createdUser = {
      id: mockNewId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "Active",
      lastActive: "Just now",
      business: "eGetinnz PH",
    };
    setUsers([createdUser, ...users]);
    setNewUser({ name: "", email: "", password: "", role: "User" });
    setIsAddModalOpen(false);
  };

  // NEW: Handle Edit Details Submit
  const handleEditDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // BACKEND NOTE: Implement PUT /api/users/:id payload: { name, email, business }
    setUsers(users.map(u => u.id === editUserDetails.id ? { 
      ...u, 
      name: editUserDetails.name, 
      email: editUserDetails.email, 
      business: editUserDetails.business 
    } : u));
    setIsEditDetailsModalOpen(false);
  };

  // NEW: Handle Edit Access Submit
  const handleEditAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // BACKEND NOTE: Implement PUT /api/users/:id/role payload: { role }
    setUsers(users.map(u => u.id === editUserAccess.id ? { ...u, role: editUserAccess.role } : u));
    setIsEditAccessModalOpen(false);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus = statusFilter === "All" || user.status === statusFilter;
    const matchesBusiness = businessFilter === "All" || user.business === businessFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesBusiness;
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
        <div className="bg-primary p-5 rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <p className="text-sm font-bold text-white z-10">Total Users</p>
          <h2 className="text-4xl font-bold text-white mt-2 z-10">{totalUsers}</h2>
          <Users size={40} className="absolute bottom-4 right-4 text-white/20 z-0" />
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex flex-col justify-between relative">
          <p className="text-sm font-bold text-primary">Active</p>
          <h2 className="text-4xl font-bold text-primary mt-2">{activeUsers}</h2>
          <UserCheck size={32} className="absolute bottom-5 right-5 text-blue-500" />
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex flex-col justify-between relative">
          <p className="text-sm font-bold text-primary">Inactive</p>
          <h2 className="text-4xl font-bold text-primary mt-2">{inactiveUsers}</h2>
          <UserMinus size={32} className="absolute bottom-5 right-5 text-blue-500" />
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex flex-col justify-between relative">
          <p className="text-sm font-bold text-primary">Admins</p>
          <h2 className="text-4xl font-bold text-primary mt-2">{adminUsers}</h2>
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

          <div className="relative" ref={filterRef}>
            <button 
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setFilterAlign(rect.left + 256 > window.innerWidth ? "right" : "left");
                setIsFilterMenuOpen(prev => !prev);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 bg-white border text-sm rounded-lg font-medium transition-colors shadow-sm shrink-0 ${
                isFilterMenuOpen || roleFilter !== "All" || statusFilter !== "All" || businessFilter !== "All"
                  ? "border-primary text-primary bg-blue-50" 
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
               <Filter size={16} /> Filter 
               {(roleFilter !== "All" || statusFilter !== "All" || businessFilter !== "All") && (
                 <span className="flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] rounded-full ml-1">
                   {(roleFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0) + (businessFilter !== "All" ? 1 : 0)}
                 </span>
               )}
               <ChevronDown size={14} className={`ml-1 transition-transform ${isFilterMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isFilterMenuOpen && (
              <div className={`absolute top-full mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-4 flex flex-col gap-4 ${filterAlign === "right" ? "right-0" : "left-0"}`}>
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
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Business</label>
                  <select 
                    value={businessFilter} 
                    onChange={(e) => setBusinessFilter(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="All">All Businesses</option>
                    {businesses.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                {(roleFilter !== "All" || statusFilter !== "All" || businessFilter !== "All") && (
                  <button 
                    onClick={() => { setRoleFilter("All"); setStatusFilter("All"); setBusinessFilter("All"); }}
                    className="text-xs text-red-500 font-bold hover:underline mt-1 text-center"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-primary text-sm rounded-lg font-bold hover:bg-[#8ebfe6] transition-colors shadow-sm shrink-0"
        >
           <Plus size={18} /> Add User
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-hidden mt-2">
        <div className="hidden md:grid md:grid-cols-[3fr_1.5fr_1.5fr_2fr_2fr_1fr] bg-primary text-white text-xs font-bold uppercase tracking-wider py-3 px-6">
           <div>User</div>
           <div>Role</div>
           <div>Status</div>
           <div>Last Active</div>
           <div>Business</div>
           <div className="text-center">Actions</div>
        </div>

        <div className="flex flex-col">
          {filteredUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-1 md:grid-cols-[3fr_1.5fr_1.5fr_2fr_2fr_1fr] gap-3 md:gap-4 p-4 md:px-6 md:py-4 items-center border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 text-white">
                     <UserCircle2 size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-tight truncate" title={user.name}>{user.name}</p>
                    <p className="text-xs text-gray-500 truncate" title={user.email}>{user.email}</p>
                  </div>
              </div>
              <div className="flex items-center pl-13 md:pl-0">
                  <span className={`text-xs font-bold px-4 py-1.5 rounded-full ${user.role === "Admin" ? "bg-primary text-white" : "bg-accent text-primary"}`}>
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
              <div className="flex items-center pl-13 md:pl-0 text-sm font-semibold text-gray-800">
                  {user.business}
              </div>
              <div className="flex items-center justify-end md:justify-center pl-13 md:pl-0 pt-2 md:pt-0">
                  <button
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setActionMenuAnchor(prev =>
                        prev?.id === user.id ? null : { id: user.id, top: rect.bottom + 4, right: window.innerWidth - rect.right }
                      );
                    }}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Actions"
                  >
                     <MoreVertical size={18} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================= */}
      {/* MODALS AREA                               */}
      {/* ========================================= */}

      {/* 1. ADD USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Add New User</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Full Name</label>
                <input type="text" required placeholder="e.g. Jane Doe" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Email Address</label>
                <input type="email" required placeholder="name@company.com" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Temporary Password</label>
                <input type="password" required placeholder="••••••••" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Account Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer">
                  <option value="User">Standard User</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold bg-primary text-white hover:bg-blue-900 rounded-lg transition-colors shadow-sm">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT DETAILS MODAL */}
      {isEditDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditDetailsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Edit User Details</h2>
              <button onClick={() => setIsEditDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditDetailsSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Full Name</label>
                <input type="text" required value={editUserDetails.name} onChange={(e) => setEditUserDetails({...editUserDetails, name: e.target.value})} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Email Address</label>
                <input type="email" required value={editUserDetails.email} onChange={(e) => setEditUserDetails({...editUserDetails, email: e.target.value})} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Business</label>
                <select value={editUserDetails.business} onChange={(e) => setEditUserDetails({...editUserDetails, business: e.target.value})} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer">
                  {businesses.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsEditDetailsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold bg-primary text-white hover:bg-blue-900 rounded-lg transition-colors shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT ACCESS MODAL */}
      {isEditAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditAccessModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Edit User Access</h2>
              <button onClick={() => setIsEditAccessModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditAccessSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Account Role</label>
                <select value={editUserAccess.role} onChange={(e) => setEditUserAccess({...editUserAccess, role: e.target.value})} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer">
                  <option value="User">Standard User</option>
                  <option value="Admin">Administrator</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="font-bold text-gray-700">Warning:</span> Granting Administrator access gives this user full control over all connected social accounts and billing features.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsEditAccessModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold bg-primary text-white hover:bg-blue-900 rounded-lg transition-colors shadow-sm">Update Access</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* ACTIONS PORTAL — renders outside table    */}
      {/* ========================================= */}
      {actionMenuAnchor && typeof window !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-100" onClick={() => setActionMenuAnchor(null)} />
          <div
            style={{ position: "fixed", top: actionMenuAnchor.top, right: actionMenuAnchor.right, zIndex: 101, minHeight: 0 }}
            className="w-44 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
          >
            {(() => {
              const u = users.find(u => u.id === actionMenuAnchor.id);
              if (!u) return null;
              return (
                <>
                  <button
                    onClick={() => {
                      setEditUserDetails({ id: u.id, name: u.name, email: u.email, business: u.business });
                      setIsEditDetailsModalOpen(true);
                      setActionMenuAnchor(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Pencil size={15} className="text-gray-400" /> Edit Details
                  </button>
                  <button
                    onClick={() => {
                      setEditUserAccess({ id: u.id, role: u.role });
                      setIsEditAccessModalOpen(true);
                      setActionMenuAnchor(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <KeyRound size={15} className="text-gray-400" /> Edit Access
                  </button>
                  <button
                    onClick={() => handleDisableUser(u.id)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors text-left"
                  >
                    <Ban size={15} className="text-yellow-500" /> {u.status === "Active" ? "Disable" : "Enable"}
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <Trash2 size={15} className="text-red-500" /> Remove User
                  </button>
                </>
              );
            })()}
          </div>
        </>,
        document.body
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