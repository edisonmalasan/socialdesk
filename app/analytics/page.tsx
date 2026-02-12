"use client";

import { 
  Users, 
  Activity, 
  Globe, 
  PieChart, 
  TrendingUp, 
  BarChart3, 
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Analytics</h1>
        <p className="text-muted">Track your social media performance</p>
      </div>

      {/* 2. Top Row: Key Metrics (Grid of 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard 
          title="Total Followers" 
          value="12,405" 
          change="+12.5%" 
          isPositive={true}
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <AnalyticsCard 
          title="Avg Engagement" 
          value="5.2%" 
          change="-0.4%" 
          isPositive={false}
          icon={<Activity className="w-5 h-5 text-secondary" />}
        />
        <AnalyticsCard 
          title="Total Reach" 
          value="45.2k" 
          change="+8.1%" 
          isPositive={true}
          icon={<Globe className="w-5 h-5 text-accent" />}
        />
        <AnalyticsCard 
          title="Platform Comparison" 
          value="Facebook" 
          subValue="Top Performer"
          isPositive={true}
          icon={<PieChart className="w-5 h-5 text-muted" />}
        />
      </div>

      {/* 3. Middle Row: Trends & Growth (Grid of 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder 
          title="Engagement Rate Trend" 
          subtitle="Daily engagement over the last 30 days"
          icon={<TrendingUp size={48} />}
        />
        <ChartPlaceholder 
          title="Follower Growth (14 Days)" 
          subtitle="New followers vs Unfollows"
          icon={<Users size={48} />}
        />
      </div>

      {/* 4. Bottom Row: Reach & Comparison (Grid of 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder 
          title="Reach & Impressions" 
          subtitle="In thousands (k)"
          icon={<BarChart3 size={48} />}
        />
        <ChartPlaceholder 
          title="Platform Comparison" 
          subtitle="Audience split by social network"
          icon={<PieChart size={48} />}
        />
      </div>
    </div>
  );
}

// --- Internal Components ---

// 1. Top Row Stat Card
function AnalyticsCard({ title, value, change, isPositive, icon, subValue }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        {change && (
          <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isPositive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
            {change}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {subValue && <span className="text-xs text-green-600 font-medium">{subValue}</span>}
        <p className="text-sm text-muted mt-1">{title}</p>
      </div>
    </div>
  );
}

// 2. Large Chart Placeholder
function ChartPlaceholder({ title, subtitle, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[350px] flex flex-col">
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
      
      {/* The "Empty State" Visual */}
      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
        <div className="text-gray-300 mb-2">
          {icon}
        </div>
        <p className="text-sm text-gray-400 font-medium">Chart Visualization Loading...</p>
        <p className="text-xs text-gray-300 mt-1">Waiting for real data connection</p>
      </div>
    </div>
  );
}