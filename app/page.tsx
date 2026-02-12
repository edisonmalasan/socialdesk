import { Users, BarChart3, Globe, Activity, Facebook, Instagram, Video } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted">Welcome back! Here&apos;s your social media overview</p>
      </div>

      {/* 2. Top Row: Summary Cards (Grid of 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Followers" 
          value="6,302" 
          icon={<Users className="w-6 h-6 text-primary" />} 
          trend="+1.2%"
        />
        
        <StatCard 
          title="Avg Engagement" 
          value="8.4%" 
          icon={<Activity className="w-6 h-6 text-secondary" />} 
          trend="-0.5%"
        />

        <StatCard 
          title="Total Reach" 
          value="12.5k" 
          icon={<Globe className="w-6 h-6 text-accent" />} 
          trend="+4.3%"
        />

        <StatCard 
          title="Total Impressions" 
          value="45k" 
          icon={<BarChart3 className="w-6 h-6 text-muted" />} 
          trend="+2.1%"
        />
      </div>

      {/* 3. Middle Row: Charts (Grid of 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col justify-center items-center text-muted">
          <Activity className="w-12 h-12 mb-4 opacity-20" />
          <p>Weekly Engagement Chart Placeholder</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col justify-center items-center text-muted">
          <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
          <p>Platform Performance Placeholder</p>
        </div>
      </div>

      {/* 4. Bottom Row: Connected Accounts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-primary mb-4">Connected Accounts</h2>
        <div className="space-y-4">
          <AccountRow 
            platform="Facebook" 
            handle="@facebook_user_741" 
            icon={<Facebook className="w-5 h-5 text-blue-600" />} 
          />
          <AccountRow 
            platform="Instagram" 
            handle="@insta_user_724" 
            icon={<Instagram className="w-5 h-5 text-pink-600" />} 
          />
          {/* X */}
          <AccountRow 
            platform="X" 
            handle="@x_user_972" 
            icon={<XIcon />} 
          />
          <AccountRow 
            platform="TikTok" 
            handle="@tiktok_official" 
            icon={<Video className="w-5 h-5 text-black" />} 
          />
        </div>
      </div>
    </div>
  );
}

// --- Internal Components ---

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <span className={`text-xs font-medium px-2 py-1 rounded ${trend.includes('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      <p className="text-sm text-muted mt-1">{title}</p>
    </div>
  );
}

function AccountRow({ platform, handle, icon }: { platform: string, handle: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        {/* Fixed width container to align icons perfectly */}
        <div className="w-8 flex justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{platform}</p>
          <p className="text-xs text-muted">{handle}</p>
        </div>
      </div>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
    </div>
  );
}

// Custom X Logo Component
function XIcon() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      aria-hidden="true" 
      className="w-4 h-4 fill-current text-black" 
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}