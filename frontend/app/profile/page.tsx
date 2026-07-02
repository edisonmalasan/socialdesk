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

  const [currentPassFocused, setCurrentPassFocused] = useState(false);
  const [newPassFocused, setNewPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Profile Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account details and security preferences.</p>
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
                className="text-sm font-bold text-primary hover:underline"
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

            {/* Full Name — readonly, floating label */}
            <div className="relative mt-3">
              <div className="flex items-center gap-3 rounded-lg px-4 py-3.5 border-2 bg-gray-50 border-gray-200 transition-all">
                <User size={18} className="shrink-0 text-gray-400" />
                <input
                  type="text"
                  disabled
                  value={profileData.name}
                  className="w-full bg-transparent text-sm text-gray-500 focus:outline-none cursor-not-allowed"
                />
              </div>
              <label className="absolute transition-all duration-200 pointer-events-none text-xs top-0 -translate-y-1/2 left-3 px-1 bg-gray-50 font-medium text-gray-500">
                Full Name
              </label>
            </div>

            {/* Email — readonly, floating label */}
            <div className="relative mt-6">
              <div className="flex items-center gap-3 rounded-lg px-4 py-3.5 border-2 bg-gray-50 border-gray-200 transition-all">
                <Mail size={18} className="shrink-0 text-gray-400" />
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="w-full bg-transparent text-sm text-gray-500 focus:outline-none cursor-not-allowed"
                />
              </div>
              <label className="absolute transition-all duration-200 pointer-events-none text-xs top-0 -translate-y-1/2 left-3 px-1 bg-gray-50 font-medium text-gray-500">
                Email Address
              </label>
              <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                <ShieldCheck size={12} className="text-green-600" />
                Email is used for login and cannot be changed directly.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Security & Passwords */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-6 flex items-center gap-2">
            <Lock size={18} className="text-gray-500 shrink-0" />
            Security
          </h2>
          
          <div className="space-y-6 max-w-xl">

            {/* Current Password — floating label */}
            <div className="relative mt-3">
              <div className={`flex items-center gap-3 rounded-lg px-4 py-3.5 border-2 transition-all ${
                currentPassFocused
                  ? "border-primary bg-white"
                  : passwords.current
                  ? "border-gray-300 bg-white"
                  : "border-transparent bg-gray-100 hover:bg-gray-200"
              }`}>
                <input
                  type={showCurrentPass ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  onFocus={() => setCurrentPassFocused(true)}
                  onBlur={() => setCurrentPassFocused(false)}
                  className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
                />
                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0">
                  {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <label className={`absolute transition-all duration-200 pointer-events-none ${
                currentPassFocused || passwords.current
                  ? "text-xs top-0 -translate-y-1/2 left-3 px-1 bg-white font-medium"
                  : "text-sm top-1/2 -translate-y-1/2 left-4 text-gray-400"
              } ${currentPassFocused ? "text-primary" : "text-gray-500"}`}>
                Current Password
              </label>
            </div>

            {/* New Password — floating label */}
            <div className="relative mt-6">
              <div className={`flex items-center gap-3 rounded-lg px-4 py-3.5 border-2 transition-all ${
                newPassFocused
                  ? "border-primary bg-white"
                  : passwords.new
                  ? "border-gray-300 bg-white"
                  : "border-transparent bg-gray-100 hover:bg-gray-200"
              }`}>
                <input
                  type={showNewPass ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  onFocus={() => setNewPassFocused(true)}
                  onBlur={() => setNewPassFocused(false)}
                  className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
                />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0">
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <label className={`absolute transition-all duration-200 pointer-events-none ${
                newPassFocused || passwords.new
                  ? "text-xs top-0 -translate-y-1/2 left-3 px-1 bg-white font-medium"
                  : "text-sm top-1/2 -translate-y-1/2 left-4 text-gray-400"
              } ${newPassFocused ? "text-primary" : "text-gray-500"}`}>
                New Password
              </label>
            </div>

            {/* Confirm New Password — floating label, always visible */}
            <div className="relative mt-6">
              <div className={`flex items-center gap-3 rounded-lg px-4 py-3.5 border-2 transition-all ${
                passwords.confirm !== "" && passwords.new !== passwords.confirm
                  ? confirmPassFocused ? "border-red-400 bg-white" : "border-red-300 bg-white"
                  : confirmPassFocused
                  ? "border-primary bg-white"
                  : passwords.confirm
                  ? "border-gray-300 bg-white"
                  : "border-transparent bg-gray-100 hover:bg-gray-200"
              }`}>
                <input
                  type={showConfirmPass ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  onFocus={() => setConfirmPassFocused(true)}
                  onBlur={() => setConfirmPassFocused(false)}
                  className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
                />
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0">
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <label className={`absolute transition-all duration-200 pointer-events-none ${
                confirmPassFocused || passwords.confirm
                  ? "text-xs top-0 -translate-y-1/2 left-3 px-1 bg-white font-medium"
                  : "text-sm top-1/2 -translate-y-1/2 left-4 text-gray-400"
              } ${
                passwords.confirm !== "" && passwords.new !== passwords.confirm
                  ? "text-red-400"
                  : confirmPassFocused ? "text-primary" : "text-gray-500"
              }`}>
                Confirm New Password
              </label>
              {passwords.confirm !== "" && passwords.new !== passwords.confirm && (
                <p className="text-xs text-red-500 font-medium mt-2">Passwords do not match.</p>
              )}
            </div>

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
            className="px-8 py-2.5 text-sm font-bold bg-primary text-white hover:bg-[#1a385b] disabled:opacity-70 disabled:cursor-not-allowed rounded-lg transition-colors shadow-md flex items-center gap-2 cursor-pointer"
          >
            {saveStatus === "saving" ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}