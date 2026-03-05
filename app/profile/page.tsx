"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { 
  User, 
  UserCircle2, 
  Mail, 
  Camera, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function ProfilePage() {
  
  // ====================================================================================
  // BACKEND NOTE: [GET] /api/users/me
  // On component mount (using useEffect), fetch the logged-in user's profile details.
  // Update this `initialProfileData` object with the response so the "Cancel" 
  // button knows exactly what data to revert to if the user aborts their changes.
  // ====================================================================================
  const initialProfileData = {
    name: "John Doe",
    email: "johndoe@gmail.com",
    avatarUrl: null as string | null,
  };

  const [profileData, setProfileData] = useState(initialProfileData);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">("idle");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ====================================================================================
      // BACKEND NOTE: [POST] /api/users/avatar
      // 1. Intercept this file upload and send it as `multipart/form-data` to the server.
      // 2. The server should upload it (e.g., AWS S3, Cloudinary) and return the image URL.
      // 3. Update the state with the actual returned URL instead of this local blob URL.
      // ====================================================================================
      const imageUrl = URL.createObjectURL(file);
      setProfileData({ ...profileData, avatarUrl: imageUrl });
    }
  };

  const handleRemovePhoto = () => {
    // ====================================================================================
    // BACKEND NOTE: [DELETE] /api/users/avatar
    // Send a request to delete the user's current avatar from the server/storage.
    // On success, set the avatarUrl state to `null`.
    // ====================================================================================
    setProfileData({ ...profileData, avatarUrl: null });
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");

    // ====================================================================================
    // BACKEND NOTE: PROFILE & PASSWORD SAVING LOGIC
    // 
    // 1. [PUT] /api/users/profile
    //    If `profileData.name` !== `initialProfileData.name`, send the new name to the DB.
    // 
    // 2. [PUT] /api/users/password
    //    If `passwords.new` is not empty:
    //    - Verify `passwords.new === passwords.confirm` (Frontend does this, but verify on backend).
    //    - Send { currentPassword: passwords.current, newPassword: passwords.new }.
    //    - Server MUST verify `currentPassword` hash matches the DB before updating.
    // ====================================================================================
    
    setTimeout(() => {
      setSaveStatus("success");
      setPasswords({ current: "", new: "", confirm: "" }); 
      setTimeout(() => setSaveStatus("idle"), 3000);
    }, 1000);
  };

  const handleCancel = () => {
    setProfileData(initialProfileData);
    setPasswords({ current: "", new: "", confirm: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12 w-full">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account details and security preferences.</p>
      </div>

      <form onSubmit={handleSaveChanges} className="flex flex-col gap-6">
        
        {/* SECTION 1: Personal Information */}
        {/* BUG FIX: Added items-center md:items-start so the avatar centers nicely on mobile! */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Avatar Column */}
          <div className="flex flex-col items-center gap-4 shrink-0 w-full md:w-48">
            <div className="relative group w-32 h-32 shrink-0 rounded-full">
              {profileData.avatarUrl ? (
                <div className="w-full h-full rounded-full overflow-hidden shadow-md border-4 border-white relative bg-white">
                  <Image src={profileData.avatarUrl} alt="Profile" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-white text-gray-800">
                  <UserCircle2 size={128} strokeWidth={1} className="text-gray-900" />
                </div>
              )}
              
              <button 
                type="button"
                onClick={handlePhotoClick}
                className="absolute inset-0 w-full h-full rounded-full bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera size={24} className="mb-1" />
                <span className="text-xs font-medium">Change</span>
              </button>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <div className="flex flex-col items-center gap-2 w-full mt-1">
              <button 
                type="button" 
                onClick={handlePhotoClick}
                className="text-sm font-bold text-[#274C77] hover:underline"
              >
                Upload new photo
              </button>
              {profileData.avatarUrl && (
                <button 
                  type="button" 
                  onClick={handleRemovePhoto}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-6 w-full">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-6 text-center md:text-left">Personal Details</h2>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              {/* BUG FIX: Switched to robust Flexbox container for inputs */}
              <div className="flex items-center w-full bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <User className="text-gray-400 shrink-0" size={18} />
                <input 
                  type="text" 
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 ml-3 text-gray-900 font-medium min-w-0 w-full p-0 truncate"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              {/* BUG FIX: Switched to robust Flexbox container for inputs */}
              <div className="flex items-center w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 shadow-sm transition-all">
                <Mail className="text-gray-400 shrink-0" size={18} />
                <input 
                  type="email" 
                  disabled
                  value={profileData.email}
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 ml-3 text-gray-500 font-medium min-w-0 w-full p-0 cursor-not-allowed truncate"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                <ShieldCheck size={12} className="text-green-600" />
                Email is used for login and cannot be changed directly.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Security & Passwords */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-6">Security</h2>
          
          <div className="space-y-6 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Current Password
              </label>
              {/* BUG FIX: Flexbox container solves text overlap! */}
              <div className="flex items-center w-full bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Lock className="text-gray-400 shrink-0" size={18} />
                <input 
                  type={showCurrentPass ? "text" : "password"} 
                  placeholder="••••••••"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 ml-3 text-gray-900 font-medium min-w-0 w-full p-0 truncate placeholder-gray-400"
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="text-gray-400 hover:text-gray-700 transition-colors shrink-0 ml-3 p-1"
                >
                  {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                New Password
              </label>
              {/* BUG FIX: Flexbox container */}
              <div className="flex items-center w-full bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Lock className="text-gray-400 shrink-0" size={18} />
                <input 
                  type={showNewPass ? "text" : "password"} 
                  placeholder="Leave blank to keep current password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 ml-3 text-gray-900 font-medium min-w-0 w-full p-0 truncate placeholder-gray-400"
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="text-gray-400 hover:text-gray-700 transition-colors shrink-0 ml-3 p-1"
                >
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {passwords.new.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                {/* BUG FIX: Dynamic Flexbox container */}
                <div className={`flex items-center w-full bg-white border rounded-lg px-4 py-3 shadow-sm transition-all focus-within:ring-2 ${
                  passwords.confirm !== "" && passwords.new !== passwords.confirm 
                    ? "border-red-300 focus-within:ring-red-200" 
                    : "border-gray-200 focus-within:ring-primary/20"
                }`}>
                  <Lock className="text-gray-400 shrink-0" size={18} />
                  <input 
                    type={showConfirmPass ? "text" : "password"} 
                    placeholder="Repeat new password"
                    required={passwords.new.length > 0}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 ml-3 text-gray-900 font-medium min-w-0 w-full p-0 truncate placeholder-gray-400"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="text-gray-400 hover:text-gray-700 transition-colors shrink-0 ml-3 p-1"
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwords.confirm !== "" && passwords.new !== passwords.confirm && (
                  <p className="text-xs text-red-500 font-medium mt-2">Passwords do not match.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-4 mt-2">
          {saveStatus === "success" && (
            <span className="flex items-center gap-1.5 text-green-600 font-bold text-sm animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 size={18} /> Profile updated!
            </span>
          )}
          <button 
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={saveStatus === "saving" || (passwords.new !== "" && passwords.new !== passwords.confirm)}
            className="px-8 py-2.5 text-sm font-bold bg-[#274C77] text-white hover:bg-[#1a385b] disabled:opacity-70 disabled:cursor-not-allowed rounded-lg transition-colors shadow-md flex items-center gap-2 cursor-pointer"
          >
            {saveStatus === "saving" ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}