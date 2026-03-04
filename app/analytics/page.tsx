"use client";

import { useState, useRef, useEffect } from "react";
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
  Download
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
  const [activeTab, setActiveTab] = useState("All");
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // BACKEND NOTE: These arrays should eventually be fetched from the database
  const pages = ["All Pages", "eGetinnz PH", "eGetinnz USA", "Fibei PH", "Fibei USA", "Digitimmerse PH", "Digitimmerse USA"];
  const platforms = ["All Platforms", "Facebook", "YouTube", "Instagram", "X", "Pinterest", "Tiktok"];
  const tabs = ["All", "Completed", "Pending", "Scheduled", "Missing"];

  // --- MOCK DATA FOR "ALL PAGES" VIEW ---
  const topPosts = [
    { id: 1, title: "FibeiTravel.com | Post-Valentine's Bohol Dive 🤿", platform: "Instagram", caption: "Celebrate the post-Valentine's vibes underwater! Explore Bohol's reefs...", date: "February 20, 2026", views: "3k", reacts: "1.5k", comments: "157", shares: "25", engagement: "12%", status: "Completed" },
    { id: 2, title: "eGetinnz.com | Celebrate CNY in Cebu 🧧", platform: "Facebook", caption: "Ring in the Year of the Snake with stunning Cebu getaways!", date: "February 15, 2026", views: "19k", reacts: "4k", comments: "290", shares: "30", engagement: "27%", status: "Completed" },
    { id: 3, title: "FibeiTravel.com | Last-Minute Romantic Vienna 🎻", platform: "Twitter", caption: "Still looking for the perfect Valentine's escape? Vienna awaits...", date: "February 12, 2026", views: "2.1k", reacts: "800", comments: "95", shares: "18", engagement: "15%", status: "Completed" },
    { id: 4, title: "eGetinnz.com | Valentine's Day Memories 💖", platform: "Tiktok", caption: "Make your Valentine's Day unforgettable with these dreamy stays...", date: "February 14, 2026", views: "5k", reacts: "2.3k", comments: "210", shares: "45", engagement: "11%", status: "Completed" },
    { id: 5, title: "FibeiTravel.com | Extend the Romance — 11-Day Luzon Tour 💗", platform: "Pinterest", caption: "Valentine's may be over, but love and adventure continue! Explore Luzon's...", date: "February 18, 2026", views: "23k", reacts: "6k", comments: "450", shares: "120", engagement: "23%", status: "Completed" },
  ];

  const pageStatsData = [
    { month: "Jan", followers: 15000, likes: 8000, views: 12000, shares: 3000, comments: 5000 },
    { month: "Feb", followers: 20000, likes: 12000, views: 18000, shares: 5000, comments: 7000 },
    { month: "Mar", followers: 35000, likes: 25000, views: 30000, shares: 8000, comments: 12000 },
    { month: "Apr", followers: 28000, likes: 18000, views: 24000, shares: 6000, comments: 9000 },
    { month: "May", followers: 22000, likes: 10000, views: 20000, shares: 4500, comments: 6500 },
    { month: "Jun", followers: 30000, likes: 15000, views: 26000, shares: 7000, comments: 10000 },
  ];

  const engagementTrendBarData = [
    { month: "Jan", rate: 20 }, { month: "Feb", rate: 14 }, { month: "Mar", rate: 25 },
    { month: "Apr", rate: 40 }, { month: "May", rate: 27 }, { month: "Jun", rate: 30 },
    { month: "Jul", rate: 10 }, { month: "Sep", rate: 4 },  { month: "Oct", rate: 18 },
    { month: "Nov", rate: 30 }, { month: "Dec", rate: 50 },
  ];
  const barColors = ['#A3CEF1', '#D6E6F2', '#8B8C89', '#FDE68A', '#FBCFE8', '#E9D5FF', '#FECDD3', '#E5E7EB', '#A7F3D0', '#BAE6FD', '#FED7AA'];

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
    <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 overflow-x-hidden overflow-y-visible w-full max-w-full min-w-0 box-border">
      
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-2 sm:gap-3 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-0.5">Track your social media performance</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          {/* BACKEND NOTE: Dropdowns update state. Use useEffect to refetch data on change. */}
          <div className="relative flex-1 min-w-0">
            <label htmlFor="analytics-page-select" className="sr-only">Select Page</label>
            <select 
              id="analytics-page-select"
              name="analytics-page"
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 sm:py-2 pl-3 pr-7 sm:pr-9 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm font-medium text-xs sm:text-sm"
            >
              {pages.map((page) => <option key={page} value={page}>{page}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-0">
            <label htmlFor="analytics-platform-select" className="sr-only">Select Platform</label>
            <select 
              id="analytics-platform-select"
              name="analytics-platform"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 sm:py-2 pl-3 pr-7 sm:pr-9 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm font-medium text-xs sm:text-sm"
            >
              {platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              id="analytics-export-btn"
              name="analytics-export"
              onClick={() => setExportOpen(!exportOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Export"
              aria-label="Export data"
              aria-expanded={exportOpen}
              aria-haspopup="true"
            >
              <Download size={20} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                <button
                  onClick={() => setExportOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet size={16} className="text-green-500 shrink-0" /> Export as CSV
                </button>
                <button
                  onClick={() => setExportOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <FileText size={16} className="text-red-500 shrink-0" /> Export as PDF
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => setExportOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="url(#jpgGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <defs>
                      <linearGradient id="jpgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg> Export Page Stats (JPG)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* Page Stats & Engagement Overview           */}
      {/* Always visible regardless of page filter   */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 min-w-0 max-w-full overflow-hidden">
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col min-w-0 overflow-hidden">
          <div className="flex flex-col gap-1.5 sm:gap-3 mb-2 sm:mb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900">Page Stats</h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500">February 11 - February 24, 2026</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[10px] sm:text-xs font-medium text-gray-600">
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span> Follower</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400"></span> Like</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></span> Views</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500"></span> Shares</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-500"></span> Comments</div>
            </div>
          </div>
          <div className="w-full h-[180px] sm:h-[220px] lg:h-[250px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pageStatsData} margin={{ top: 5, right: 5, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} width={35} tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number | undefined) => [value !== undefined ? value.toLocaleString() : '', '']} />
                <Line type="monotone" dataKey="followers" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="likes" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="shares" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="comments" stroke="#ec4899" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 sm:mb-4">Engagement Overview</h3>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:gap-4">
            <div className="bg-[#9ABDD3]/40 p-1.5 sm:p-2 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl flex flex-col items-start justify-between min-h-[100px] sm:min-h-[130px] lg:min-h-[160px]">
              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 bg-white rounded-md lg:rounded-lg flex items-center justify-center text-primary shadow-sm shrink-0">
                <ChevronDown size={12} className="rotate-180 sm:hidden" />
                <ChevronDown size={14} className="rotate-180 hidden sm:block lg:hidden" />
                <ChevronDown size={20} className="rotate-180 hidden lg:block" />
              </div>
              <div className="w-full">
                <h4 className="text-sm sm:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900">24.6k</h4>
                <p className="text-[7px] sm:text-[9px] lg:text-xs text-gray-600 font-medium leading-tight mt-0.5">Engagement Rate Trend</p>
                <div className="mt-1 sm:mt-1.5 lg:mt-3 inline-flex items-center gap-0.5 bg-white/60 px-1 sm:px-1.5 py-0.5 rounded text-[6px] sm:text-[7px] lg:text-[10px] font-bold text-gray-700">
                  <ArrowUp size={6} className="text-gray-500" /> 0.8% <span className="text-gray-400 font-normal ml-0.5">Weekly</span>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-1.5 sm:p-2 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl flex flex-col items-start justify-between min-h-[100px] sm:min-h-[130px] lg:min-h-[160px]">
              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 bg-white rounded-md lg:rounded-lg flex items-center justify-center text-yellow-500 shadow-sm shrink-0">
                <span className="font-bold text-xs sm:text-sm lg:text-xl">★</span>
              </div>
              <div className="w-full">
                <h4 className="text-sm sm:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900">16.2k</h4>
                <p className="text-[7px] sm:text-[9px] lg:text-xs text-gray-600 font-medium leading-tight mt-0.5">Account Likes</p>
                <div className="mt-1 sm:mt-1.5 lg:mt-3 inline-flex items-center gap-0.5 bg-white/60 px-1 sm:px-1.5 py-0.5 rounded text-[6px] sm:text-[7px] lg:text-[10px] font-bold text-gray-700">
                  <ArrowUp size={6} className="text-yellow-500" /> 0.3% <span className="text-gray-400 font-normal ml-0.5">Monthly</span>
                </div>
              </div>
            </div>
            <div className="bg-pink-50 p-1.5 sm:p-2 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl flex flex-col items-start justify-between min-h-[100px] sm:min-h-[130px] lg:min-h-[160px]">
              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 bg-white rounded-md lg:rounded-lg flex items-center justify-center text-pink-500 shadow-sm shrink-0">
                <span className="font-bold text-xs sm:text-sm lg:text-xl">💬</span>
              </div>
              <div className="w-full">
                <h4 className="text-sm sm:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900">27.8k</h4>
                <p className="text-[7px] sm:text-[9px] lg:text-xs text-gray-600 font-medium leading-tight mt-0.5">User Comments</p>
                <div className="mt-1 sm:mt-1.5 lg:mt-3 inline-flex items-center gap-0.5 bg-white/60 px-1 sm:px-1.5 py-0.5 rounded text-[6px] sm:text-[7px] lg:text-[10px] font-bold text-gray-700">
                  <ArrowUp size={6} className="text-pink-500" /> 5.36% <span className="text-gray-400 font-normal ml-0.5">Weekly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* VIEW 1: "ALL PAGES" SELECTED              */}
      {/* ========================================= */}
      {selectedPage === "All Pages" ? (
        <>
          {/* Top Posts & Engagement Bar Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 min-w-0 max-w-full overflow-hidden">
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 min-w-0 overflow-hidden">
              <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 sm:mb-4">Top Posts this Week</h3>
              <div className="flex flex-col divide-y divide-gray-50">
                {topPosts.map((post) => (
                  <div key={post.id} className="py-3 sm:py-4 space-y-2">
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                      <div className="w-10 h-7 sm:w-12 sm:h-8 relative rounded-md overflow-hidden shrink-0 bg-gray-200">
                        <Image src="/greece.png" alt="Thumbnail" fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="text-[11px] sm:text-xs font-bold text-gray-900 truncate flex-1 min-w-0">{post.title}</p>
                          <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold tracking-wide shrink-0 ${getStatusBadge(post.status)}`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 truncate mt-0.5">{post.caption}</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">{post.date}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      <div>
                        <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Views</p>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.views}</p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Reacts</p>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.reacts}</p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Comments</p>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.comments}</p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Shares</p>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.shares}</p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Engage</p>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.engagement}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 min-w-0 overflow-hidden self-start">
              <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 sm:mb-4">Engagement Rate Trend</h3>
              <div className="w-full h-[180px] sm:h-[220px] lg:h-[250px] min-w-0">
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
        <div className="flex flex-col gap-2 sm:gap-3 lg:gap-6 mt-1 min-w-0 overflow-hidden">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5 min-w-0">
            <div className="bg-white p-2 sm:p-2.5 lg:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-500 font-medium mb-0.5">Total Posts</p>
              <h2 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold text-gray-900">15,685</h2>
            </div>
            <div className="bg-white p-2 sm:p-2.5 lg:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-500 font-medium mb-0.5">Total Followers</p>
              <h2 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold text-gray-900">29,451</h2>
            </div>
            <div className="bg-white p-2 sm:p-2.5 lg:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-500 font-medium mb-0.5">Total Likes</p>
              <h2 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold text-gray-900">521,998</h2>
            </div>
            <div className="bg-white p-2 sm:p-2.5 lg:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-500 font-medium mb-0.5">Total Comments</p>
              <h2 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold text-gray-900">21,052</h2>
            </div>
            <div className="bg-white p-2 sm:p-2.5 lg:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm col-span-2 lg:col-span-1">
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-500 font-medium mb-0.5">Total Shares</p>
              <h2 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold text-gray-900">24,679</h2>
            </div>
          </div>

          {/* Tabbed Data Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-0 max-w-full">
            
            {/* Tabs */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 px-3 sm:px-4 lg:px-6 pt-2.5 sm:pt-3 border-b border-gray-100 overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 sm:pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? "border-primary text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Mobile Card View (visible below lg) */}
            <div className="block lg:hidden divide-y divide-gray-50">
              {specificPagePosts.map((post) => (
                <div key={post.id} className="p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-hidden">
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                    <div className="w-10 h-7 sm:w-12 sm:h-8 relative rounded overflow-hidden bg-gray-200 shrink-0">
                      <Image src="/greece.png" alt="Thumbnail" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-[11px] sm:text-xs font-bold text-gray-900 truncate flex-1 min-w-0">{post.title}</p>
                        <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold tracking-wide shrink-0 max-w-[72px] truncate ${getStatusBadge(post.status)}`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 truncate mt-0.5">{post.caption}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">{post.date}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 sm:grid-cols-5 sm:gap-2 text-center pl-0">
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Views</p>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.views}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Reacts</p>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.reacts}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Comments</p>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.comments}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Shares</p>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.shares}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Engage</p>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.engagement}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (visible at lg+) */}
            <div className="hidden lg:block overflow-x-auto">
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
            <div className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 border-t border-gray-100 text-[10px] sm:text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">1-12</span> of <span className="font-bold text-gray-900">12</span> Entries
            </div>
          </div>
        </div>
      )}

    </div>
  );
}