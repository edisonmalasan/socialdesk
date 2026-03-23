"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import {
  Facebook,
  Instagram,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Video,
  PlayCircle,
  Image as ImageIcon,
  Edit3,
  CalendarClock,
  Type,
  Share2,
  ImagePlus,
  X,
  Save,
  Clock as ClockIcon,
  MoreHorizontal,
  Eye,
  Copy,
  BarChart2,
  Heart,
  MessageCircle,
  Repeat2,
  Filter,
  ChevronDown,
  Youtube,
  Linkedin,
  Search,
  CalendarRange
} from "lucide-react";

// 1. Updated Post Type to support Media type
type Post = {
  id: string;
  content: string;
  status: "published" | "scheduled" | "failed";
  platforms: string[];
  date: string;
  page: string;
  mediaType?: "image" | "video" | "none";
  mediaUrl?: string;
  stats?: {
    likes: number;
    comments: number;
    shares: number;
  };
};

// Modal Types
type ModalMode = "edit" | "reschedule" | null;
type EditingPost = Post | null;

type FilterStatus = "all" | "published" | "scheduled";
type FilterPlatform = "all" | "facebook" | "instagram" | "tiktok" | "x" | "youtube" | "pinterest";
type ViewMode = "table" | "card";

export default function PostsPage() {
  // 2. Mock Data with Images and Videos
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      content: "Exited to launch our new product! 🚀 #LaunchDay",
      status: "published",
      platforms: ["facebook", "instagram"],
      date: "02/28/2026",
      page: "eGetinnz USA",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      stats: { likes: 144, comments: 58, shares: 278 }
    },
    {
      id: "2",
      content: "Behind the scenes at our annual team retreat. Check out the vibes! 🌴",
      status: "scheduled",
      platforms: ["facebook"],
      date: "02/28/2026",
      page: "eGetinnz PH",
      mediaType: "video",
      mediaUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
      stats: { likes: 144, comments: 58, shares: 278 }
    },
    {
      id: "3",
      content: "Just a quick text update about our holiday hours.",
      status: "published",
      platforms: ["instagram"],
      date: "02/28/2026",
      page: "eGetinnz PH",
      mediaType: "none",
      stats: { likes: 144, comments: 58, shares: 278 }
    },
    {
      id: "4",
      content: "Summer sale starts next week! Get ready for amazing discounts on all products ☀️ #SummerSale",
      status: "published",
      platforms: ["tiktok"],
      date: "02/28/2026",
      page: "eGetinnz PH",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
      stats: { likes: 144, comments: 58, shares: 278 }
    },
    {
      id: "5",
      content: "Check out our new Facebook page!",
      status: "published",
      platforms: ["facebook", "instagram"],
      date: "02/28/2026",
      page: "eGetinnz USA",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      stats: { likes: 144, comments: 58, shares: 278 }
    },
    {
      id: "6",
      content: "Instagram exclusive content!",
      status: "published",
      platforms: ["instagram"],
      date: "02/28/2026",
      page: "eGetinnz PH",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      stats: { likes: 144, comments: 58, shares: 278 }
    }
  ]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Date filter states
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [platformFilter, setPlatformFilter] = useState<FilterPlatform>("all");
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<FilterPlatform | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingPost, setEditingPost] = useState<EditingPost>(null);
  
  // Dropdown state for each post
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const deletePost = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      setPosts(posts.filter(post => post.id !== id));
    }
    setOpenDropdownId(null);
  };

  const openEditModal = (post: Post, mode: ModalMode) => {
    setEditingPost(post);
    setModalMode(mode);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode(null);
    setEditingPost(null);
  };

  const handlePlatformSelect = (platform: FilterPlatform) => {
    setSelectedPlatform(platform === selectedPlatform ? null : platform);
    setPlatformFilter(platform);
    setViewMode(platform === "all" ? "table" : "card");
    setIsPlatformDropdownOpen(false);
  };

  const applyDateFilter = () => {
    setDateFilterOpen(false);
    // Date filtering logic will be applied automatically through filteredPosts
  };

  const clearDateFilter = () => {
    setFromDate("");
    setToDate("");
    setDateFilterOpen(false);
  };

  // Helper function to parse date string (MM/DD/YYYY) to Date object
  const parseDate = (dateStr: string): Date => {
    const [month, day, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Enhanced search function that searches across multiple fields
  const matchesSearch = (post: Post, query: string): boolean => {
    if (!query) return true;
    
    const lowercaseQuery = query.toLowerCase();
    
    // Search in content
    if (post.content.toLowerCase().includes(lowercaseQuery)) return true;
    
    // Search in page name
    if (post.page.toLowerCase().includes(lowercaseQuery)) return true;
    
    // Search in platforms
    if (post.platforms.some(platform => 
      platform.toLowerCase().includes(lowercaseQuery)
    )) return true;
    
    // Search for platform names even if they're partial matches
    // This handles cases like "face" matching "facebook"
    const platformKeywords = ["face", "insta", "tiktok", "you", "tube", "pint", "x", "twitter"];
    if (platformKeywords.some(keyword => 
      lowercaseQuery.includes(keyword) && 
      post.platforms.some(platform => 
        platform.toLowerCase().includes(keyword)
      )
    )) return true;
    
    return false;
  };

  // Filter posts based on search, status, platform, and date range
  const filteredPosts = posts.filter(post => {
    // Search filter
    if (!matchesSearch(post, searchQuery)) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== "all" && post.status !== statusFilter) {
      return false;
    }
    
    // Platform filter
    if (platformFilter !== "all" && !post.platforms.includes(platformFilter)) {
      return false;
    }

    // Date range filter
    if (fromDate || toDate) {
      const postDate = parseDate(post.date);
      
      if (fromDate) {
        const from = new Date(fromDate);
        if (postDate < from) return false;
      }
      
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999); // End of the day
        if (postDate > to) return false;
      }
    }
    
    return true;
  });

  // Get counts for each status
  const publishedCount = posts.filter(p => p.status === "published").length;
  const scheduledCount = posts.filter(p => p.status === "scheduled").length;

  
  return (
    <div className="w-full space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header with Sort by Date - Only show in table view */}
      {viewMode === "table" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">Post</h1>
            <p className="text-xs sm:text-sm text-gray-500">View and manage your post</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by content, platform, or page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort by Post dropdown */}
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-full sm:min-w-[140px]">
              <option>Sort by Post</option>
            </select>

            {/* Sort by Date button with calendar popup */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setDateFilterOpen(!dateFilterOpen)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                Sort by Date
              </button>

              {/* Date Filter Popup */}
              {dateFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDateFilterOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-full sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarRange size={18} className="text-blue-600" />
                      Filter by Date Range
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From:
                        </label>
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To:
                        </label>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          min={fromDate}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={clearDateFilter}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={applyDateFilter}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Apply Filter
                        </button>
                      </div>
                    </div>

                    {/* Active filters indicator */}
                    {(fromDate || toDate) && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium mb-1">Active filters:</p>
                        <div className="space-y-1">
                          {fromDate && (
                            <p className="text-xs text-blue-600">
                              From: {new Date(fromDate).toLocaleDateString()}
                            </p>
                          )}
                          {toDate && (
                            <p className="text-xs text-blue-600">
                              To: {new Date(toDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header for Card View - Post title and filters in same line */}
      {viewMode === "card" && (
        <div className="relative pt-12 sm:pt-0">
          {/* Post title on the left */}
          <div className="sm:absolute sm:left-0 sm:top-0 text-center sm:text-left mb-4 sm:mb-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">Post</h2>
            <p className="text-xs sm:text-sm text-gray-500">VIEW AND MANAGE YOUR POST</p>
          </div>
          
          {/* Centered filters */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-0 sm:pt-2">
            {/* Status Tabs as inline buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 font-medium text-xs sm:text-sm rounded-lg transition-colors ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All ({posts.length})
              </button>
              <button
                onClick={() => setStatusFilter("scheduled")}
                className={`px-3 py-1.5 font-medium text-xs sm:text-sm rounded-lg transition-colors ${
                  statusFilter === "scheduled"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Scheduled ({scheduledCount})
              </button>
              <button
                onClick={() => setStatusFilter("published")}
                className={`px-3 py-1.5 font-medium text-xs sm:text-sm rounded-lg transition-colors ${
                  statusFilter === "published"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Published ({publishedCount})
              </button>
            </div>

            {/* Sort by Date button with calendar popup */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setDateFilterOpen(!dateFilterOpen)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                Sort by Date
              </button>

              {/* Date Filter Popup */}
              {dateFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDateFilterOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-full sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarRange size={18} className="text-blue-600" />
                      Filter by Date Range
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From:
                        </label>
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To:
                        </label>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          min={fromDate}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={clearDateFilter}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={applyDateFilter}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Apply Filter
                        </button>
                      </div>
                    </div>

                    {/* Active filters indicator */}
                    {(fromDate || toDate) && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium mb-1">Active filters:</p>
                        <div className="space-y-1">
                          {fromDate && (
                            <p className="text-xs text-blue-600">
                              From: {new Date(fromDate).toLocaleDateString()}
                            </p>
                          )}
                          {toDate && (
                            <p className="text-xs text-blue-600">
                              To: {new Date(toDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search results summary */}
      {searchQuery && (
        <div className="text-sm text-gray-600">
          Found {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} matching "{searchQuery}"
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 sm:px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                  <th className="text-left px-4 sm:px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">PLATFORM</th>
                  <th className="text-left px-4 sm:px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">PAGE</th>
                  <th className="text-left px-4 sm:px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">POST</th>
                  <th className="text-left px-4 sm:px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ENGAGEMENT</th>
                  <th className="text-left px-4 sm:px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="text-left px-4 sm:px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-xs sm:text-sm text-gray-500">{post.date}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={post.platforms[0]} />
                          <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize">
                            {post.platforms[0]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{post.page}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3 max-w-[200px] lg:max-w-xs">
                          {post.mediaType !== 'none' && post.mediaUrl && (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={post.mediaUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="text-xs sm:text-sm text-gray-700 line-clamp-2">{post.content}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {post.stats && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                            <span className="flex items-center gap-1 text-xs sm:text-sm">
                              <Heart size={14} className="text-red-400" /> {post.stats.likes}
                            </span>
                            <span className="flex items-center gap-1 text-xs sm:text-sm">
                              <MessageCircle size={14} className="text-blue-400" /> {post.stats.comments}
                            </span>
                            <span className="flex items-center gap-1 text-xs sm:text-sm">
                              <Repeat2 size={14} className="text-green-400" /> {post.stats.shares}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <StatusBadge status={post.status} />
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(post, "edit")}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 sm:px-6 py-8 text-center text-gray-500">
                      No posts found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Select Platform Section - Only shown in table view */}
          <div className="mt-6 sm:mt-8">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Select Platform</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Facebook", icon: <Facebook size={24} className="text-blue-600" />, key: "facebook" },
                { name: "Instagram", icon: <Instagram size={24} className="text-pink-600" />, key: "instagram" },
                { name: "Youtube", icon: <Youtube size={24} className="text-red-600" />, key: "youtube" },
                { name: "TikTok", icon: <Video size={24} className="text-black" />, key: "tiktok" },
                { name: "Pinterest", icon: <ImageIcon size={24} className="text-red-500" />, key: "pinterest" },
                { name: "X (Twitter)", icon: <XIcon className="w-6 h-6" />, key: "x" }
              ].map((platform) => (
                <button
                  key={platform.key}
                  onClick={() => handlePlatformSelect(platform.key as FilterPlatform)}
                  className={`flex items-center gap-4 p-4 sm:p-6 rounded-xl border-2 transition-all ${
                    selectedPlatform === platform.key
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-700"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {platform.icon}
                  </div>
                  <span className="text-base sm:text-lg font-semibold">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Card View (when platform selected) */}
      {viewMode === "card" && selectedPlatform && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {selectedPlatform} Posts
            </h3>
            <button
              onClick={() => {
                setViewMode("table");
                setPlatformFilter("all");
                setSelectedPlatform(null);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors font-medium w-full sm:w-auto justify-center"
            >
              <ArrowLeft size={18} className="text-white" />
              <span>Back to Table</span>
            </button>
          </div>
          
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative">
                <div className="p-4 sm:p-6 pb-16">
                  {/* Light Grey Background for Date Line */}
                  <div className="absolute left-0 right-0 top-0 h-[52px] bg-gray-200 rounded-t-xl" />
                  
                  {/* 3 Dots Menu - Positioned in top right */}
<div className="absolute top-[-6px] sm:top-4 right-2 z-[100]">
  <div className="relative">
    <button
      onClick={() => setOpenDropdownId(openDropdownId === post.id ? null : post.id)}
      className="text-black-800 hover:text-black p-2 rounded-full transition-colors"
    >
                        <MoreHorizontal size={18} />
                      </button>
                      
                      {openDropdownId === post.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenDropdownId(null)}
                          />
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                            {/* Always show Edit option for all posts */}
                            <button
                              onClick={() => openEditModal(post, "edit")}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit3 size={14} /> Edit
                            </button>
                            
                            {/* Show Reschedule option only for scheduled posts */}
                            {post.status === 'scheduled' && (
                              <button
                                onClick={() => openEditModal(post, "reschedule")}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <CalendarClock size={14} /> Reschedule
                              </button>
                            )}
                            
                            {/* Unpublish option for published posts */}
                            {post.status === 'published' && (
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Eye size={14} /> Unpublish
                              </button>
                            )}
                            
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Copy size={14} /> Copy Link
                            </button>
                            
                            <button
                              onClick={() => deletePost(post.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 mt-1 pt-2"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Layout: Content + Media Side-by-Side */}
                  <div className="flex flex-col md:flex-row gap-4 sm:gap-6 relative z-10">
                    {/* Media Preview Section */}
                    {post.mediaType !== 'none' && post.mediaUrl && (
                      <div className="w-full md:w-48 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200">
                        <img
                          src={post.mediaUrl}
                          alt="Post media"
                          className="w-full h-full object-cover"
                        />
                        
                        {post.mediaType === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all">
                            <PlayCircle className="text-white w-10 h-10 opacity-90" />
                          </div>
                        )}

                        <div className="absolute top-2 right-2 bg-black/50 p-1 rounded text-white backdrop-blur-sm">
                          {post.mediaType === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                        </div>
                      </div>
                    )}

                    {/* Text Content Section */}
                    <div className="flex-1 min-w-0">
                      {/* Date and Page Name with pipe separator */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <Calendar size={14} className="text-gray-600" />
                          <span className="text-gray-700">{post.date}</span>
                        </div>
                        <span className="text-gray-400 text-sm hidden sm:inline">|</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{post.page}</span>
                      </div>

                      {/* Description */}
                      <p className="text-sm sm:text-base text-gray-800 leading-relaxed mb-4 break-words">
                        {post.content}
                      </p>

                      {/* Platform and Engagement Stats */}
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        {/* Platform Icon and Name */}
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center">
                            <PlatformIcon platform={post.platforms[0]} />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize">
                            {post.platforms[0]}
                          </span>
                        </div>

                        {/* Engagement Stats */}
                        {post.stats && (
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Heart size={16} className="text-red-400" />
                              <span className="text-xs sm:text-sm">{post.stats.likes}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <MessageCircle size={16} className="text-blue-400" />
                              <span className="text-xs sm:text-sm">{post.stats.comments}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Repeat2 size={16} className="text-green-400" />
                              <span className="text-xs sm:text-sm">{post.stats.shares}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Badge - Positioned at bottom right of the card */}
                <div className="absolute bottom-4 right-4 z-20">
                  {post.status === 'published' ? (
                    <div className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-100 rounded-full shadow-sm">
                      <CheckCircle2 size={14} className="text-green-600" />
                      <span className="text-xs font-semibold text-green-700">Published</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-100 rounded-full shadow-sm">
                      <Clock size={14} className="text-yellow-600" />
                      <span className="text-xs font-semibold text-yellow-700">Scheduled</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              No posts found matching your search criteria
            </div>
          )}
        </div>
      )}

      {/* Edit/Reschedule Modal */}
      {isModalOpen && editingPost && (
        <EditModal
          post={editingPost}
          mode={modalMode}
          onClose={closeModal}
          onSave={(updatedPost: Post) => {
            setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
            closeModal();
          }}
        />
      )}
    </div>
  );
}

// --- Modal Component ---
function EditModal({
  post,
  mode,
  onClose,
  onSave
}: {
  post: Post;
  mode: ModalMode;
  onClose: () => void;
  onSave: (updatedPost: Post) => void;
}) {
  const [activeTab, setActiveTab] = useState<"edit" | "reschedule">(mode === "reschedule" ? "reschedule" : "edit");
  
  // Edit form state
  const [caption, setCaption] = useState<string>(post.content);
  const [platforms, setPlatforms] = useState<string[]>(post.platforms);
  const [hashtags, setHashtags] = useState<string>(post.content.match(/#\w+/g)?.join(" ") || "");
  
  // Reschedule form state
  const [newDate, setNewDate] = useState<string>("2026-02-20");
  const [newTime, setNewTime] = useState<string>("14:30");

  const handleSave = () => {
    let updatedPost = { ...post };

    if (activeTab === "edit") {
      let updatedContent = caption;
      
      const hashtagArray: string[] = hashtags.split(/\s+/).filter((tag: string): tag is string => tag.startsWith("#"));
      const captionHashtags: string[] = caption.match(/#\w+/g) || [];
      
      hashtagArray.forEach((tag: string) => {
        if (!captionHashtags.includes(tag)) {
          updatedContent += ` ${tag}`;
        }
      });

      updatedPost = {
        ...updatedPost,
        content: updatedContent,
        platforms: platforms,
      };
    } else if (activeTab === "reschedule") {
      const dateObj = new Date(`${newDate} ${newTime}`);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '/');

      updatedPost = {
        ...updatedPost,
        date: formattedDate,
      };
    }

    onSave(updatedPost);
  };

  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {activeTab === "edit" ? "Edit Post" : "Reschedule Post"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-col sm:flex-row border-b border-gray-100">
          <button
            className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-center gap-2 font-medium text-sm sm:text-base transition-colors ${
              activeTab === "edit"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("edit")}
          >
            <Edit3 size={18} />
            Edit Content
          </button>
          <button
            className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-center gap-2 font-medium text-sm sm:text-base transition-colors ${
              activeTab === "reschedule"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("reschedule")}
          >
            <CalendarClock size={18} />
            Reschedule
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {activeTab === "edit" ? (
            <>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Type size={16} />
                  Change Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCaption(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  placeholder="Write your caption..."
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Share2 size={16} />
                  Change Platforms
                </label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {["facebook", "instagram", "tiktok", "x", "youtube", "pinterest"].map((platform: string) => (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border text-sm transition-colors ${
                        platforms.includes(platform)
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <PlatformIcon platform={platform} />
                      <span className="text-xs sm:text-sm capitalize">{platform}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ImagePlus size={16} />
                  Change Media
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 sm:p-8 text-center hover:border-gray-300 transition-colors cursor-pointer">
                  <ImagePlus className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600">Click to upload new image or video</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, MP4 up to 10MB</p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar size={16} />
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ClockIcon size={16} />
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">Currently scheduled for:</p>
                <p className="text-sm text-blue-600">{post.date}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatusBadge({ status }: { status: string }) {
  type StatusType = "published" | "scheduled" | "failed";
  
  const styles: Record<StatusType, string> = {
    published: "bg-green-100 text-green-700 border-green-200",
    scheduled: "bg-yellow-100 text-yellow-700 border-blue-200",
    failed: "bg-red-100 text-red-700 border-red-200",
  };

  const icons: Record<StatusType, React.ReactNode> = {
    published: <CheckCircle2 size={12} className="mr-1.5" />,
    scheduled: <Clock size={12} className="mr-1.5" />,
    failed: <AlertCircle size={12} className="mr-1.5" />,
  };

  const labels: Record<StatusType, string> = {
    published: "Published",
    scheduled: "Scheduled",
    failed: "Failed",
  };

  const validStatus = status as StatusType;

  return (
    <span className={`flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold border ${styles[validStatus]}`}>
      {icons[validStatus]}
      {labels[validStatus]}
    </span>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'facebook': return <Facebook size={14} className="text-blue-600" />;
    case 'instagram': return <Instagram size={14} className="text-pink-600" />;
    case 'tiktok': return <Video size={14} className="text-black" />;
    case 'x': return <XIcon className="w-3.5 h-3.5" />;
    case 'youtube': return <Youtube size={14} className="text-red-600" />;
    case 'linkedin': return <Linkedin size={14} className="text-blue-700" />;
    default: return <Video size={14} />;
  }
}

function XIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-current text-black ${className}`}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}