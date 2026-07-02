"use client";

import { useState } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Mail, 
  Save,
  Camera
} from "lucide-react";

export default function SettingsPage() {
  // Mock State for Form Fields
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
        <p className="text-muted">Manage your workspace preferences</p>
      </div>

      {/* 1. PROFILE SETTINGS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <User size={20} className="text-primary" />
            Profile Information
          </h2>
          <p className="text-xs text-muted mt-1">Update your photo and personal details.</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 relative overflow-hidden group">
              {/* Placeholder Avatar */}
              <User size={40} />
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <div>
              <button className="text-sm font-medium text-primary border border-primary px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                Change Photo
              </button>
              <p className="text-xs text-muted mt-2">JPG, GIF or PNG. 1MB Max.</p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">First Name</label>
              <input 
                type="text" 
                defaultValue="John"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Last Name</label>
              <input 
                type="text" 
                defaultValue="Doe"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="email" 
                  defaultValue="johndoe@gmail.com"
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors"
          >
            {isLoading ? "Saving..." : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* 2. NOTIFICATIONS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell size={20} className="text-secondary" />
            Notifications
          </h2>
          <p className="text-xs text-muted mt-1">Manage when you receive email alerts.</p>
        </div>
        
        <div className="p-6 space-y-4">
          <ToggleRow 
            title="Post Publishing Success" 
            desc="Get notified when a scheduled post goes live successfully."
            defaultChecked={true}
          />
          <ToggleRow 
            title="Post Failure Alerts" 
            desc="Get notified immediately if a post fails to publish."
            defaultChecked={true}
          />
          <ToggleRow 
            title="Weekly Analytics Report" 
            desc="Receive a summary of your growth every Monday."
            defaultChecked={false}
          />
        </div>
      </div>

      
    </div>
  );
}

// --- Helper Components ---

function ToggleRow({ title, desc, defaultChecked }: { title: string, desc: string, defaultChecked: boolean }) {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      
      {/* Custom CSS Toggle Switch */}
      <button 
        onClick={() => setEnabled(!enabled)}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
          enabled ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <div 
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`} 
        />
      </button>
    </div>
  );
}

function TeamMemberRow({ name, email, role, isMe }: any) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            {name}
            {isMe && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">YOU</span>}
          </p>
          <p className="text-xs text-muted">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{role}</span>
        {!isMe && <button className="text-xs text-red-500 hover:underline">Remove</button>}
      </div>
    </div>
  );
}