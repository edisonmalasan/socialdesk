"use client";

import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

export default function AnalyticsPage() {
  
  // --- MOCK DATA FOR CHARTS ---
  const trendData = [
    { name: 'Jan', rate: 20 }, { name: 'Feb', rate: 15 }, { name: 'Mar', rate: 25 },
    { name: 'Apr', rate: 40 }, { name: 'May', rate: 28 }, { name: 'Jun', rate: 30 },
    { name: 'Jul', rate: 10 }, { name: 'Aug', rate: 5 },  { name: 'Sep', rate: 18 },
    { name: 'Oct', rate: 30 }, { name: 'Nov', rate: 50 }, { name: 'Dec', rate: 50 },
  ];

  const growthData = [
    { name: 'Sun', total: 10, new: 5 }, { name: 'Mon', total: 35, new: 10 },
    { name: 'Tue', total: 40, new: 30 }, { name: 'Wed', total: 30, new: 15 },
    { name: 'Thu', total: 15, new: 5 },  { name: 'Fri', total: 20, new: 12 },
    { name: 'Sat', total: 25, new: 18 },
  ];

  const reachData = [
    { name: 'Digitimmerse Artworks', reach: 25, impress: 20 }, { name: 'Digitimmerse E-Card', reach: 30, impress: 35 },
    { name: 'eGettinz USA', reach: 15, impress: 45 },    { name: 'Fibei USA', reach: 48, impress: 30 },
    { name: 'eGetinnz PH', reach: 52, impress: 42 },     { name: 'Fibei PH', reach: 35, impress: 25 },
  ];

  const platformData = [
    { name: 'Facebook', value: 43.89, color: '#90C2E7' }, // Light Blue
    { name: 'Instagram', value: 18.78, color: '#274C77' }, // Dark Blue
    { name: 'Youtube', value: 11.6, color: '#4A8FE7' },   // Med Blue
    { name: 'Twitter', value: 9.59, color: '#E7ECEF' },   // Grey
    { name: 'Tiktok', value: 8.93, color: '#6096BA' },    // Steel Blue
    { name: 'Pinterest', value: 10.8, color: '#A3CEF1' }, // Pale Blue
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500">Track your social media performance</p>
      </div>

      {/* 2. Top Metric Cards (Row 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Primary Card (Dark Blue) */}
        <div className="bg-primary text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <p className="text-sm opacity-80 mb-1">Total Followers</p>
          <h3 className="text-4xl font-bold mb-4">6,302</h3>
          <p className="text-xs italic opacity-60">As of February 11, 2026</p>
        </div>

        {/* Standard Cards (White) */}
        <StatCard title="Avg. Engagement" value="500" date="February 11, 2026" />
        <StatCard title="Total Reach" value="10,000" date="February 11, 2026" />
        <StatCard title="Total Impression" value="702" date="February 11, 2026" />
      </div>

      {/* 3. Middle Charts (Row 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Engagement Rate Trend (Line Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Engagement Rate Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#eee" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#274C77" strokeWidth={2} dot={{ r: 4, fill: "#274C77" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Follower Growth (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Follower Growth (14 Days)</h3>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6096BA]"></span> Total</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#274C77]"></span> New</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#274C77" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="new" fill="#6096BA" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Bottom Charts (Row 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reach vs Impressions (Bar Chart) - Spans 2 cols */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Reach and Impressions</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reachData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="reach" fill="#274C77" radius={[2, 2, 0, 0]} barSize={20} />
                <Bar dataKey="impress" fill="#6096BA" radius={[2, 2, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Split (Donut Chart) - Spans 1 col */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 w-full mb-2">Platform Comparison</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text Trick */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">Platforms</p>
                <p className="text-xs text-gray-400">Connected</p>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {platformData.map((p) => (
              <div key={p.name} className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                {p.name} {p.value}%
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper for white cards
function StatCard({ title, value, date }: { title: string, value: string, date: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <h3 className="text-4xl font-bold text-gray-900 mb-4">{value}</h3>
      <p className="text-xs italic text-gray-400">As of {date}</p>
    </div>
  );
}