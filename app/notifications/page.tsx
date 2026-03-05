"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Info,
  MoreHorizontal,
  Check,
  Trash2,
  BellRing
} from "lucide-react";

// Define the notification type
type Notification = {
  id: number;
  type: "success" | "alert" | "social" | "info";
  title: string;
  message: string;
  time: string;
  date: string;
  unread: boolean;
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("All");

  // BACKEND NOTE: Fetch this from GET /api/notifications (implement pagination e.g., ?page=1&limit=20)
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: "success", title: "Post Published", message: "Your post 'Spring Sale' was published successfully to Facebook and Instagram.", time: "2 mins ago", date: "Today", unread: true },
    { id: 2, type: "alert", title: "Action Required", message: "Facebook token is expiring in 2 days. Please navigate to Accounts to reconnect.", time: "1 hour ago", date: "Today", unread: true },
    { id: 3, type: "social", title: "New Comment", message: "Sarah Jane commented on your Instagram post: 'Love this! 😍'", time: "3 hours ago", date: "Today", unread: false },
    { id: 4, type: "info", title: "Weekly Report Ready", message: "Your analytics report for Feb 11 - Feb 17 is now available for download.", time: "1 day ago", date: "Yesterday", unread: false },
    { id: 5, type: "social", title: "Post Shared", message: "Your post 'Top 10 Destinations' was shared 45 times on Pinterest.", time: "1 day ago", date: "Yesterday", unread: false },
    { id: 6, type: "alert", title: "Failed to Publish", message: "Twitter API rate limit exceeded. Scheduled post 'Morning Motivation' failed.", time: "2 days ago", date: "Feb 16, 2026", unread: false },
    { id: 7, type: "success", title: "Account Connected", message: "TikTok account @eGetinnz successfully linked to SocialDesk.", time: "3 days ago", date: "Feb 15, 2026", unread: false },
  ]);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Derived state
  const unreadCount = notifications.filter(n => n.unread).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "Unread") return n.unread;
    if (activeTab === "Alerts") return n.type === "alert";
    if (activeTab === "Social") return n.type === "social";
    return true; // "All"
  });

  const tabs = ["All", "Unread", "Alerts", "Social"];

  // Helper for notification icons
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={20} className="text-green-500" />;
      case 'alert': return <AlertCircle size={20} className="text-red-500" />;
      case 'social': return <MessageSquare size={20} className="text-blue-500" />;
      case 'info': return <Info size={20} className="text-gray-500" />;
      default: return <BellRing size={20} className="text-gray-500" />;
    }
  };

  // BACKEND NOTE: PUT /api/notifications/mark-all-read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // BACKEND NOTE: PUT /api/notifications/:id/read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
    setOpenMenuId(null);
  };

  // BACKEND NOTE: DELETE /api/notifications/:id
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    setOpenMenuId(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12 w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated on your account activity</p>
        </div>
        
        {/* BUG FIX: The closing </div> was previously inside this condition! */}
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Check size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-gray-100 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === tab 
                  ? "border-primary text-gray-900" 
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
              {tab === "Unread" && unreadCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex flex-col min-h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 text-gray-400">
              <BellRing size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-bold text-gray-800 mb-1">You're all caught up!</p>
              <p className="text-sm">No {activeTab.toLowerCase()} notifications to show right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 sm:p-6 flex items-start gap-4 transition-colors relative group ${
                    notification.unread ? 'bg-blue-50/20 hover:bg-blue-50/40' : 'hover:bg-gray-50/80'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notification.unread ? 'bg-white shadow-sm' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-10">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-base leading-tight ${notification.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                        {notification.title}
                      </p>
                      {notification.unread && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                      )}
                    </div>
                    <p className={`text-sm mb-2 max-w-3xl ${notification.unread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <span>{notification.time}</span>
                      <span>•</span>
                      <span>{notification.date}</span>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === notification.id ? null : notification.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    
                    {openMenuId === notification.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                          {notification.unread && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Check size={16} className="text-gray-400" /> Mark as read
                            </button>
                          )}
                          <button 
                            onClick={() => deleteNotification(notification.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} className="text-red-400" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredNotifications.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Showing <span className="font-bold text-gray-900">{filteredNotifications.length}</span> results</span>
            {/* BACKEND NOTE: Hook up actual pagination controls here */}
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-not-allowed opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}