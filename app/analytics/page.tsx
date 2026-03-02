"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  FileText, 
  FileSpreadsheet, 
  ChevronDown,
  ArrowUp,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Share
} from "lucide-react";

import { FaTiktok, FaPinterest } from "react-icons/fa";

import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function AnalyticsPage() {
  const [selectedPage, setSelectedPage] = useState("All Pages");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [activeTab, setActiveTab] = useState("All"); // For the Specific Page Table

  // BACKEND NOTE: These arrays should eventually be fetched from the database
  const pages = ["All Pages", "eGetinnz PH", "eGetinnz USA", "Fibei PH", "Fibei USA", "Digitimmerse PH", "Digitimmerse USA"];
  const platforms = ["All Platforms", "Facebook", "YouTube", "Instagram", "X", "Pinterest", "Tiktok"];
  const tabs = ["All", "Completed", "Pending", "Scheduled", "Missing"];

  // --- MOCK DATA FOR "ALL PAGES" VIEW ---
  const topPosts = [
    { id: 1, title: "FibeiTravel.com | Post-Valentine's Bohol Dive 🤿", platform: "Instagram", reach: "7k", growth: "12%" },
    { id: 2, title: "eGetinnz.com | Celebrate CNY in Cebu 🧧", platform: "Facebook", reach: "19k", growth: "27%" },
    { id: 3, title: "FibeiTravel.com | Last-Minute Romantic Vienna 🎻", platform: "Twitter", reach: "2.1k", growth: "15%" },
    { id: 4, title: "eGetinnz.com | Valentine's Day Memories 💖", platform: "Tiktok", reach: "5k", growth: "11%" },
    { id: 5, title: "FibeiTravel.com | Extend the Romance — 11-Day Luzon Tour 💗", platform: "Pinterest", reach: "23k", growth: "23%" },
  ];

  const pageStatsData = [
    { month: "Jan", followers: 15000, likes: 8000 },
    { month: "Feb", followers: 20000, likes: 12000 },
    { month: "Mar", followers: 35000, likes: 25000 },
    { month: "Apr", followers: 28000, likes: 18000 },
    { month: "May", followers: 22000, likes: 10000 },
    { month: "Jun", followers: 30000, likes: 15000 },
  ];

  const engagementTrendBarData = [
    { month: "Jan", rate: 20 }, { month: "Feb", rate: 14 }, { month: "Mar", rate: 25 },
    { month: "Apr", rate: 40 }, { month: "May", rate: 27 }, { month: "Jun", rate: 30 },
    { month: "Jul", rate: 10 }, { month: "Sep", rate: 4 },  { month: "Oct", rate: 18 },
    { month: "Nov", rate: 30 }, { month: "Dec", rate: 50 },
  ];
  const barColors = ['#A3CEF1', '#D6E6F2', '#8B8C89', '#FDE68A', '#FBCFE8', '#E9D5FF', '#FECDD3', '#E5E7EB', '#A7F3D0', '#BAE6FD', '#FED7AA'];

  const linkClicksData = [{ name: 'A', uv: 10 }, { name: 'B', uv: 25 }, { name: 'C', uv: 15 }, { name: 'D', uv: 30 }, { name: 'E', uv: 12 }, { name: 'F', uv: 18 }, { name: 'G', uv: 5 }];
  const photoClicksData = [{ name: 'A', uv: 5 }, { name: 'B', uv: 15 }, { name: 'C', uv: 8 }, { name: 'D', uv: 20 }, { name: 'E', uv: 12 }, { name: 'F', uv: 25 }, { name: 'G', uv: 30 }];

  // --- MOCK DATA FOR "SPECIFIC PAGE" VIEW ---
  // BACKEND NOTE: Fetch this table data based on the selectedPage, selectedPlatform, and activeTab filters
  const specificPagePosts = [
    { id: 1, title: "FibeiTravel.com | Post-Valentine's...", caption: "Celebrate the post-Valentine's vibes underwater! Explore Bohol's reefs...", date: "February 20, 2026", views: "3k", reacts: "1.5k", comments: "157", shares: "25", engagement: "12%", status: "Completed" },
    { id: 2, title: "FibeiTravel.com | Coron Island Adventure", caption: "Valentine's may be over, but adventure is just getting started! Explore...", date: "February 28, 2026", views: "2k", reacts: "4k", comments: "290", shares: "30", engagement: "13%", status: "Missing" },
    { id: 3, title: "FibeiTravel.com | Makati Street Food Tour", caption: "Valentine's may be over, but flavor adventures continue! Explore Makati's...", date: "February 24, 2026", views: "5k", reacts: "3k", comments: "300", shares: "15", engagement: "23%", status: "Completed" },
    { id: 4, title: "FibeiTravel.com | Extend the Romance...", caption: "Valentine's may be over, but romance isn't! Explore Bohol's scenic...", date: "February 28, 2026", views: "0k", reacts: "0k", comments: "0", shares: "0", engagement: "0%", status: "Pending" },
    { id: 5, title: "FibeiTravel.com | Extend the Romance...", caption: "Valentine's may be over, but love and adventure continue! Explore Luzon's...", date: "March 01, 2026", views: "0k", reacts: "0k", comments: "0", shares: "0", engagement: "0%", status: "Scheduled" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-700";
      case "Missing": return "bg-red-100 text-red-700";
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Scheduled": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col gap-6 overflow-x-hidden">
      
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your social media performance</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* BACKEND NOTE: Dropdowns update state. Use useEffect to refetch data on change. */}
          <div className="relative w-full sm:w-auto flex-1">
            <select 
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm font-medium"
            >
              {pages.map((page) => <option key={page} value={page}>{page}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto flex-1">
            <select 
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm font-medium"
            >
              {platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Conditional Export Buttons based on selected view */}
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {selectedPage === "All Pages" ? (
              <>
                <button className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm" title="Export as PDF">
                  <FileText size={20} />
                </button>
                <button className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm" title="Export as CSV">
                  <FileSpreadsheet size={20} />
                </button>
              </>
            ) : (
              <button className="px-5 py-2.5 bg-[#274C77] text-white rounded-lg hover:bg-blue-900 transition-colors shadow-sm font-medium flex items-center gap-2">
                Export <Share size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* VIEW 1: "ALL PAGES" SELECTED              */}
      {/* ========================================= */}
      {selectedPage === "All Pages" ? (
        <>
          {/* Row 1: Page Stats & Engagement Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-6">Engagement Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-[250px] sm:h-auto">
                <div className="bg-[#9ABDD3]/40 p-5 rounded-2xl flex sm:flex-col justify-between items-center sm:items-start sm:aspect-[4/5] gap-4 sm:gap-0">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                    <ChevronDown size={20} className="rotate-180" />
                  </div>
                  <div className="flex-1 sm:flex-none w-full">
                    <h4 className="text-2xl xl:text-3xl font-bold text-gray-900">24.6k</h4>
                    <p className="text-xs text-gray-600 font-medium leading-tight mt-1">Engagement Rate Trend</p>
                    <div className="mt-3 inline-flex items-center gap-1 bg-white/60 px-2 py-1 rounded text-[10px] font-bold text-gray-700">
                      <ArrowUp size={10} className="text-gray-500" /> 0.8% <span className="text-gray-400 font-normal ml-1">Weekly</span>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-5 rounded-2xl flex sm:flex-col justify-between items-center sm:items-start sm:aspect-[4/5] gap-4 sm:gap-0">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-yellow-500 shadow-sm shrink-0">
                    <span className="font-bold text-xl">★</span>
                  </div>
                  <div className="flex-1 sm:flex-none w-full">
                    <h4 className="text-2xl xl:text-3xl font-bold text-gray-900">16.2k</h4>
                    <p className="text-xs text-gray-600 font-medium leading-tight mt-1">Account Likes</p>
                    <div className="mt-3 inline-flex items-center gap-1 bg-white/60 px-2 py-1 rounded text-[10px] font-bold text-gray-700">
                      <ArrowUp size={10} className="text-yellow-500" /> 0.3% <span className="text-gray-400 font-normal ml-1">Monthly</span>
                    </div>
                  </div>
                </div>
                <div className="bg-pink-50 p-5 rounded-2xl flex sm:flex-col justify-between items-center sm:items-start sm:aspect-[4/5] gap-4 sm:gap-0">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pink-500 shadow-sm shrink-0">
                    <span className="font-bold text-xl">💬</span>
                  </div>
                  <div className="flex-1 sm:flex-none w-full">
                    <h4 className="text-2xl xl:text-3xl font-bold text-gray-900">27.8k</h4>
                    <p className="text-xs text-gray-600 font-medium leading-tight mt-1">User Comments</p>
                    <div className="mt-3 inline-flex items-center gap-1 bg-white/60 px-2 py-1 rounded text-[10px] font-bold text-gray-700">
                      <ArrowUp size={10} className="text-pink-500" /> 5.36% <span className="text-gray-400 font-normal ml-1">Weekly</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Link Clicks & Photo Clicks (NEW) */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Link Clicks</h3>
              <div className="flex items-end justify-between mb-4">
                <p className="text-xs text-gray-500 font-medium">Male 40% &nbsp;&nbsp; Female 60%</p>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visitors</p>
                  <p className="text-2xl font-bold text-gray-900 leading-none">22,658</p>
                </div>
              </div>
              <div className="w-full h-[120px] -ml-4 sm:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={linkClicksData}>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="uv" stroke="#f97316" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Photo Clicks</h3>
              <div className="flex items-end justify-between mb-4">
                <p className="text-xs text-gray-500 font-medium">Male 78% &nbsp;&nbsp; Female 22%</p>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visitors</p>
                  <p className="text-2xl font-bold text-gray-900 leading-none">18,459</p>
                </div>
              </div>
              <div className="w-full h-[120px] -ml-4 sm:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={photoClicksData}>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="uv" stroke="#22c55e" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 3: Top Posts & Engagement Bar Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Top Posts this Week</h3>
              <div className="flex flex-col">
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
                      <span className="text-[11px] font-medium text-gray-900 sm:w-8"><Eye size={12} className="inline mr-1 text-gray-400"/>{post.reach}</span>
                      <span className="flex items-center text-[11px] font-bold text-gray-700 sm:w-10">
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

            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Engagement Rate Trend</h3>
              <div className="w-full h-[250px] min-h-[250px] mt-4 -ml-4 sm:ml-0">
                {/* BACKEND NOTE: Updated to BarChart as per new wireframe */}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementTrendBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={20}>
                      {engagementTrendBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ========================================= */
        /* VIEW 2: "SPECIFIC PAGE" SELECTED          */
        /* ========================================= */
        <div className="flex flex-col gap-6 mt-2">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium mb-1">Total Posts</p>
              <h2 className="text-2xl font-bold text-gray-900">15,685</h2>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium mb-1">Total Followers</p>
              <h2 className="text-2xl font-bold text-gray-900">29,451</h2>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium mb-1">Total Likes</p>
              <h2 className="text-2xl font-bold text-gray-900">521,998</h2>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium mb-1">Total Comments</p>
              <h2 className="text-2xl font-bold text-gray-900">21,052</h2>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-1 col-span-2">
              <p className="text-xs text-gray-500 font-medium mb-1">Total Shares</p>
              <h2 className="text-2xl font-bold text-gray-900">24,679</h2>
            </div>
          </div>

          {/* Tabbed Data Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Tabs */}
            <div className="flex items-center gap-6 px-6 pt-4 border-b border-gray-100 overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? "border-primary text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Photo <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Post Title <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Caption <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Views <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Reacts <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Comments <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Shares <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Engagement <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Status <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* BACKEND NOTE: Map through filtered posts here */}
                  {specificPagePosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="w-12 h-8 relative rounded overflow-hidden bg-gray-200">
                          <Image src="/greece.png" alt="Thumbnail" fill className="object-cover" />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-gray-900 max-w-[200px] truncate" title={post.title}>{post.title}</td>
                      <td className="py-4 px-6 text-xs text-gray-500 max-w-[250px] truncate" title={post.caption}>{post.caption}</td>
                      <td className="py-4 px-6 text-xs font-medium text-gray-700 whitespace-nowrap">{post.date}</td>
                      <td className="py-4 px-4 text-xs font-bold text-gray-700 text-center"><Eye size={12} className="inline mr-1 text-gray-400"/> {post.views}</td>
                      <td className="py-4 px-4 text-xs font-bold text-gray-700 text-center"><Heart size={12} className="inline mr-1 text-gray-400"/> {post.reacts}</td>
                      <td className="py-4 px-4 text-xs font-bold text-gray-700 text-center"><MessageCircle size={12} className="inline mr-1 text-gray-400"/> {post.comments}</td>
                      <td className="py-4 px-4 text-xs font-bold text-gray-700 text-center"><Share2 size={12} className="inline mr-1 text-gray-400"/> {post.shares}</td>
                      <td className="py-4 px-4 text-xs font-bold text-gray-700 text-center"><ArrowUp size={10} className="inline mr-0.5"/> {post.engagement}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${getStatusBadge(post.status)}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button className="text-gray-400 hover:text-primary transition-colors p-1">
                          <ExternalLink size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination / Footer */}
            <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">1-12</span> of <span className="font-bold text-gray-900">12</span> Entries
            </div>
          </div>
        </div>
      )}

    </div>
  );
}