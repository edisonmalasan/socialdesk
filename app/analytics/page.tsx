"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  FileText, 
  FileSpreadsheet, 
  ChevronDown,
  ArrowUp,
  ExternalLink,
  Facebook,
  Instagram,
  Twitter,
  Youtube
} from "lucide-react";

// Import the new icons from react-icons
import { FaTiktok, FaPinterest } from "react-icons/fa";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function AnalyticsPage() {
  const [selectedPage, setSelectedPage] = useState("All Pages");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");

  // BACKEND NOTE: These arrays should eventually be fetched from the database based on the user's connected accounts.
  const pages = ["All Pages", "eGetinnz PH", "eGetinnz USA", "Fibei PH", "Fibei USA", "Digitimmerse PH", "Digitimmerse USA"];
  const platforms = ["All Platforms", "Facebook", "YouTube", "Instagram", "X", "Pinterest", "Tiktok"];

  // BACKEND NOTE: Mock data for "Top Posts". Replace with real API data filtered by selectedPage and selectedPlatform.
  const topPosts = [
    { id: 1, title: "FibeiTravel.com | Post-Valentine's Bohol Dive 🤿", platform: "Instagram", reach: "7k", growth: "12%" },
    { id: 2, title: "eGetinnz.com | Celebrate CNY in Cebu 🧧", platform: "Facebook", reach: "19k", growth: "27%" },
    { id: 3, title: "FibeiTravel.com | Last-Minute Romantic Vienna 🎻", platform: "Twitter", reach: "2.1k", growth: "15%" },
    { id: 4, title: "eGetinnz.com | Valentine's Day Memories 💖", platform: "Tiktok", reach: "5k", growth: "11%" },
    { id: 5, title: "FibeiTravel.com | Extend the Romance — 11-Day Luzon Tour 💗", platform: "Pinterest", reach: "23k", growth: "23%" },
  ];

  // BACKEND NOTE: Recharts Mock Data for "Page Stats"
  const pageStatsData = [
    { month: "Jan", followers: 15000, likes: 8000 },
    { month: "Feb", followers: 20000, likes: 12000 },
    { month: "Mar", followers: 35000, likes: 25000 },
    { month: "Apr", followers: 28000, likes: 18000 },
    { month: "May", followers: 22000, likes: 10000 },
    { month: "Jun", followers: 30000, likes: 15000 },
  ];

  // BACKEND NOTE: Recharts Mock Data for "Engagement Rate Trend"
  const engagementTrendData = [
    { month: "Jan", rate: 20 },
    { month: "Feb", rate: 14 },
    { month: "Mar", rate: 25 },
    { month: "Apr", rate: 40 },
    { month: "May", rate: 27 },
    { month: "Jun", rate: 30 },
    { month: "Jul", rate: 10 },
    { month: "Sep", rate: 4 },
    { month: "Oct", rate: 18 },
    { month: "Nov", rate: 30 },
    { month: "Dec", rate: 50 },
  ];

  // BACKEND NOTE: Mock data for "Connected Accounts". Notice the new FaTiktok and FaPinterest components.
  const connectedAccounts = [
    { id: 1, platform: "Facebook", handle: "@john_doe123", icon: Facebook, color: "text-blue-600" },
    { id: 2, platform: "Tiktok", handle: "@john_doe123", icon: FaTiktok, color: "text-black" }, 
    { id: 3, platform: "Instagram", handle: "@john_doe123", icon: Instagram, color: "text-pink-600" },
    { id: 4, platform: "Twitter", handle: "@john_doe123", icon: Twitter, color: "text-blue-400" },
    { id: 5, platform: "Pinterest", handle: "@john_doe123", icon: FaPinterest, color: "text-red-600" }, 
    { id: 6, platform: "Youtube", handle: "@john_doe123", icon: Youtube, color: "text-red-600" },
  ];

  return (
    <div className="flex flex-col gap-6 overflow-x-hidden">
      
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your social media performance</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* BACKEND NOTE: These dropdowns update the React state. Use useEffect hooks to refetch data when they change. */}
          <div className="relative w-full sm:w-auto flex-1">
            <select 
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm font-medium"
            >
              {pages.map((page) => <option key={page} value={page}>{page}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto flex-1">
            <select 
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm font-medium"
            >
              {platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm" title="Export as PDF">
              <FileText size={20} />
            </button>
            <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm" title="Export as CSV">
              <FileSpreadsheet size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* BACKEND NOTE: Top KPI Row. This ONLY renders if a specific page (NOT "All Pages") is selected. */}
      {selectedPage !== "All Pages" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-primary text-white p-6 rounded-2xl shadow-sm">
              <p className="text-sm font-medium opacity-90">Total Followers</p>
              {/* BACKEND NOTE: Inject real metric data here based on selectedPage */}
              <h2 className="text-4xl font-bold mt-2 mb-4">6,302</h2>
              <p className="text-xs opacity-75 italic">As of February 26, 2026</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">500</h2>
              <p className="text-xs text-gray-400 italic">As of February 26, 2026</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-600">Total Comments</p>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">10,000</h2>
              <p className="text-xs text-gray-400 italic">As of February 26, 2026</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-600">Total Shares</p>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">702</h2>
              <p className="text-xs text-gray-400 italic">As of February 26, 2026</p>
          </div>
        </div>
      )}

      {/* Middle Row: Page Stats & Engagement Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Page Stats Chart */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Page Stats</h3>
              <p className="text-xs text-gray-500">February 11 - February 24, 2026</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Follower</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Like</div>
            </div>
          </div>
          
          <div className="w-full h-[250px] min-h-[250px] mt-4 -ml-4 sm:ml-0">
            {/* BACKEND NOTE: Pass dynamic pageStatsData here */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pageStatsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="followers" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="likes" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Overview */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-6">Engagement Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#9ABDD3]/40 p-4 rounded-xl flex sm:flex-col justify-between items-center sm:items-start sm:aspect-square gap-4 sm:gap-0">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm shrink-0">
                <ChevronDown size={16} className="rotate-180" />
              </div>
              <div className="flex-1 sm:flex-none">
                <h4 className="text-xl xl:text-2xl font-bold text-gray-900">24.6k</h4>
                <p className="text-[10px] text-gray-600 font-medium leading-tight mt-1">Engagement Rate Trend</p>
              </div>
            </div>
            <div className="bg-yellow-100/60 p-4 rounded-xl flex sm:flex-col justify-between items-center sm:items-start sm:aspect-square gap-4 sm:gap-0">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-yellow-500 shadow-sm shrink-0">
                <span className="font-bold text-lg">★</span>
              </div>
              <div className="flex-1 sm:flex-none">
                <h4 className="text-xl xl:text-2xl font-bold text-gray-900">16.2k</h4>
                <p className="text-[10px] text-gray-600 font-medium leading-tight mt-1">Account Likes</p>
              </div>
            </div>
            <div className="bg-pink-100/60 p-4 rounded-xl flex sm:flex-col justify-between items-center sm:items-start sm:aspect-square gap-4 sm:gap-0">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-pink-500 shadow-sm shrink-0">
                <span className="font-bold text-lg">💬</span>
              </div>
              <div className="flex-1 sm:flex-none">
                <h4 className="text-xl xl:text-2xl font-bold text-gray-900">27.8k</h4>
                <p className="text-[10px] text-gray-600 font-medium leading-tight mt-1">User Comments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Posts & Engagement Trend */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Top Posts This Week */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Top Posts this Week</h3>
          <div className="flex flex-col">
            {/* BACKEND NOTE: Map through the dynamic topPosts array here */}
            {topPosts.map((post) => (
              <div key={post.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-8 relative rounded-md overflow-hidden shrink-0 bg-gray-200">
                     <Image src="/greece.png" alt="Thumbnail" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{post.title}</p>
                    <p className="text-[10px] text-gray-400 sm:hidden mt-0.5">{post.platform}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-16 sm:pl-0">
                  <span className="hidden sm:inline-block text-[11px] text-gray-500 w-16">{post.platform}</span>
                  <span className="text-[11px] font-medium text-gray-900 sm:w-8">{post.reach}</span>
                  <span className="flex items-center text-[11px] font-bold text-green-600 sm:w-10">
                    <ArrowUp size={10} className="mr-0.5" /> {post.growth}
                  </span>
                  <button className="text-gray-400 hover:text-primary transition-colors">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Rate Trend Chart */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Engagement Rate Trend</h3>
          <div className="w-full h-[250px] min-h-[250px] mt-4 -ml-4 sm:ml-0">
            {/* BACKEND NOTE: Pass dynamic engagementTrendData here */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="linear" dataKey="rate" stroke="#274C77" strokeWidth={2} dot={{ r: 5, fill: '#274C77' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Connected Accounts List */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 mt-2">
        <h3 className="font-bold text-lg text-gray-900 mb-6">Connected Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BACKEND NOTE: Map through the dynamic connectedAccounts array here */}
          {connectedAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 rounded-full border border-gray-200 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                
                {/* Fixed the bounding box so all icons perfectly align */}
                <div className="shrink-0 flex items-center justify-center w-5 h-5">
                  <account.icon size={20} className={account.color} />
                </div>
                
                {/* Removed truncate classes that were squishing the text */}
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none">{account.platform}</p>
                  <p className="text-xs text-gray-500 mt-1">{account.handle}</p>
                </div>

              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm mr-2 shrink-0"></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}