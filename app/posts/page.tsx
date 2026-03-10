"use client";

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
  Linkedin
} from "lucide-react";

// 1. Updated Post Type to support Media type
type Post = {
  id: string;
  content: string;
  status: "published" | "scheduled" | "failed";
  platforms: string[];
  date: string;
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

export default function PostsPage() {
  // 2. Mock Data with Images and Videos
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      content: "Excited to launch our new product! 🚀 #LaunchDay",
      status: "published",
      platforms: ["facebook", "instagram"],
      date: "Feb 8, 2026, 10:20 AM",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      stats: { likes: 213, comments: 143, shares: 67 }
    },
    {
      id: "2",
      content: "Behind the scenes at our annual team retreat. Check out the vibes! 🌴",
      status: "scheduled",
      platforms: ["tiktok"],
      date: "Feb 14, 2026, 5:00 PM",
      mediaType: "video",
      mediaUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
      stats: { likes: 111, comments: 231, shares: 56 }
    },
    {
      id: "3",
      content: "Just a quick text update about our holiday hours.",
      status: "published",
      platforms: ["x"],
      date: "Feb 10, 2026, 9:00 AM",
      mediaType: "none",
      stats: { likes: 285, comments: 345, shares: 56 }
    },
    {
      id: "4",
      content: "Summer sale starts next week! Get ready for amazing discounts on all products ☀️ #SummerSale",
      status: "scheduled",
      platforms: ["facebook", "instagram", "tiktok"],
      date: "Feb 20, 2026, 12:00 PM",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
      stats: { likes: 64, comments: 123, shares: 23 }
    }
  ]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [platformFilter, setPlatformFilter] = useState<FilterPlatform>("all");
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  
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

  // Filter posts based on status and platform
  const filteredPosts = posts.filter(post => {
    // Status filter
    if (statusFilter !== "all" && post.status !== statusFilter) {
      return false;
    }
    
    // Platform filter
    if (platformFilter !== "all" && !post.platforms.includes(platformFilter)) {
      return false;
    }
    
    return true;
  });

  // Get counts for each status
  const publishedCount = posts.filter(p => p.status === "published").length;
  const scheduledCount = posts.filter(p => p.status === "scheduled").length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header with Title and Platform Filter + Calendar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Posts</h1>
          <p className="text-muted">View and manage your posts</p>
        </div>
        
        {/* Platform Filter and Calendar - Now on the same line as title */}
        <div className="flex items-center gap-2">
          {/* Platform Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium">
                {platformFilter === "all" ? "All platform" : platformFilter.charAt(0).toUpperCase() + platformFilter.slice(1)}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            
            {isPlatformDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsPlatformDropdownOpen(false)}
                />
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                  {["all", "facebook", "instagram", "tiktok", "x", "youtube", "pinterest"].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => {
                        setPlatformFilter(platform as FilterPlatform);
                        setIsPlatformDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        platformFilter === platform ? "bg-blue-50 text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {platform !== "all" && <PlatformIcon platform={platform} />}
                      <span className="capitalize">{platform}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Calendar Button */}
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-4">
        {/* Status Filters */}
        <div>
          <div className="flex items-center gap-4 border-b border-gray-200">
            <button
              onClick={() => setStatusFilter("all")}
              className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                statusFilter === "all"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("scheduled")}
              className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                statusFilter === "scheduled"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                statusFilter === "published"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Published
            </button>
          </div>
          {/* Published count moved below */}
          <div className="mt-2 text-sm text-gray-500">
            {publishedCount} Published
          </div>
        </div>

        {/* Sort and New Post */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
              <option>Sort by Newest</option>
              <option>Sort by Oldest</option>
              <option>Sort by Most Engaged</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              + New Post
            </button>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            
            {/* Header: Status & Actions */}
            <div className="flex justify-between items-start mb-4">
              <StatusBadge status={post.status} />
              
              {/* 3 Dots Menu */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdownId(openDropdownId === post.id ? null : post.id)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreHorizontal size={18} />
                </button>
                
                {openDropdownId === post.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpenDropdownId(null)}
                    />
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Eye size={14} /> View
                      </button>
                      {post.status === 'scheduled' && (
                        <button
                          onClick={() => openEditModal(post, "edit")}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                      )}
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
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Layout: Content + Media Side-by-Side */}
            <div className="flex flex-col md:flex-row gap-6">
              
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
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-gray-800 text-lg font-medium leading-relaxed mb-2">
                    {post.content}
                  </h3>
                </div>

                {/* Footer: Platforms, Date, and Stats */}
                <div className="space-y-3">
                  {/* Platforms and Date */}
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {post.platforms.map(p => (
                        <div key={p} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm relative z-10">
                          <PlatformIcon platform={p} />
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-muted font-medium flex items-center gap-1.5">
                      {post.status === 'scheduled' ? <Calendar size={14} /> : <Clock size={14} />}
                      {post.date}
                    </span>
                  </div>

                  {/* Engagement Stats */}
                  {post.stats && (
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Heart size={16} className="text-red-400" />
                        <span className="text-sm font-medium">{post.stats.likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MessageCircle size={16} className="text-blue-400" />
                        <span className="text-sm font-medium">{post.stats.comments}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Repeat2 size={16} className="text-green-400" />
                        <span className="text-sm font-medium">{post.stats.shares}</span>
                      </div>
                      <button className="ml-auto text-gray-400 hover:text-gray-600">
                        <BarChart2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).replace(',', ',');

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
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-primary">
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
        <div className="flex border-b border-gray-100">
          <button
            className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-colors ${
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
            className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-colors ${
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
        <div className="p-6 space-y-6">
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Write your caption..."
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Share2 size={16} />
                  Change Platforms
                </label>
                <div className="flex flex-wrap gap-3">
                  {["facebook", "instagram", "tiktok", "x", "youtube", "pinterest"].map((platform: string) => (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        platforms.includes(platform)
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <PlatformIcon platform={platform} />
                      <span className="text-sm capitalize">{platform}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ImagePlus size={16} />
                  Change Media
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-gray-300 transition-colors cursor-pointer">
                  <ImagePlus className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600">Click to upload new image or video</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, MP4 up to 10MB</p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
    scheduled: "bg-blue-100 text-blue-700 border-blue-200",
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
    <span className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${styles[validStatus]}`}>
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
    case 'x': return <XIcon />;
    case 'youtube': return <Youtube size={14} className="text-red-600" />;
    case 'linkedin': return <Linkedin size={14} className="text-blue-700" />;
    default: return <Video size={14} />;
  }
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current text-black">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}