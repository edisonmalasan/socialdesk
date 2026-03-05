"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Search, Bell, User, Menu, ChevronDown, LogOut, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  
  // UI States
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Refs for click-outside handling
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // BACKEND NOTE: Fetch notifications via GET /api/notifications. 
  // Consider using WebSockets or Server-Sent Events (SSE) for real-time updates.
  const [notifications, setNotifications] = useState([
    { id: 1, type: "success", title: "Post Published", message: "Your post 'Spring Sale' was published successfully.", time: "2m ago", unread: true },
    { id: 2, type: "alert", title: "Action Required", message: "Facebook token is expiring in 2 days. Please reconnect.", time: "1h ago", unread: true },
    { id: 3, type: "social", title: "New Comment", message: "Sarah Jane commented on your Instagram post.", time: "3h ago", unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(false);
    setUserMenuOpen(false);
    Cookies.remove("auth-token");
    Cookies.remove("user-role"); // Clean up admin cookie too
    router.push("/login");
  };

  // BACKEND NOTE: Implement PUT request to /api/notifications/mark-read to update status in DB
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // Helper for notification icons
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'alert': return <AlertCircle size={16} className="text-red-500" />;
      case 'social': return <MessageSquare size={16} className="text-blue-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <>
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

          <div className="relative w-full max-w-xs md:w-96 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            {/* BACKEND NOTE: Add a debounced API call on search input change (e.g. GET /api/search?q=query) to provide global search results */}
            <input 
              type="text" 
              placeholder="Search anything..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* 2. Right Actions */}
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserMenuOpen(false); // Close user menu if open
              }}
              className={`relative text-primary hover:bg-blue-50 p-2 rounded-full transition-colors cursor-pointer ${notificationsOpen ? 'bg-blue-50' : ''}`}
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
                {/* Notifications Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-primary font-medium hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      No new notifications.
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-gray-50">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${notification.unread ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notification.unread ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-tight mb-0.5 ${notification.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{notification.time}</p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* View All Footer */}
                <div className="p-2 border-t border-gray-100 bg-white">
                  <button 
                    onClick={() => {
                      setNotificationsOpen(false);
                      router.push("/notifications");
                    }}
                    className="w-full py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu Dropdown */}
          <div className="relative pl-4 md:pl-6 border-l border-gray-200" ref={userMenuRef}>
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotificationsOpen(false); // Close notifications if open
              }}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-10 h-10 rounded-full bg-[#274C77] flex items-center justify-center text-white overflow-hidden shrink-0 shadow-sm">
                <User size={24} /> 
              </div>
              <div className="hidden md:flex items-center gap-1.5">
                {/* BACKEND NOTE: Dynamically populate these fields via API (e.g. GET /api/users/me) or decode them from the active JWT token. */}
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none text-left">John Doe</p>
                  <p className="text-[11px] text-gray-500 mt-1 text-left">johndoe@gmail.com</p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                {/* Mobile-only: show name in dropdown */}
                <div className="md:hidden px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">johndoe@gmail.com</p>
                </div>
                <button
                  onClick={() => { setUserMenuOpen(false); router.push("/profile"); }} 
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <User size={16} className="text-gray-400 shrink-0" /> Profile
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { setUserMenuOpen(false); setShowLogoutModal(true); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut size={16} className="text-red-400 shrink-0" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-sm p-6 sm:p-8 text-center overflow-hidden">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <LogOut size={28} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Sign out?</h2>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}