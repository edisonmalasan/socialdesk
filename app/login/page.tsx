"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    Cookies.set("auth-token", "valid-token", { expires: 1 });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#D6E6F2]">
      
      {/* Logo */}
      <div className="mb-10 relative w-64 h-16">
        <Image 
          src="/logo-v1.png" 
          alt="SocialDesk" 
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col items-center gap-4">
        
        {/* Username Field */}
        <input 
          type="text" 
          placeholder="Enter Username" 
          className="w-full bg-[#B8D1E6] placeholder-gray-600 text-gray-800 px-6 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
          required
        />
        
        {/* Password Field (Updated with Eye Icon) */}
        <div className="relative w-full">
          <input 
            // 4. Dynamically change the input type based on state
            type={showPassword ? "text" : "password"} 
            placeholder="Enter Password" 
            // Added 'pr-12' to give the text breathing room so it doesn't hide behind the icon
            className="w-full bg-[#B8D1E6] placeholder-gray-600 text-gray-800 pl-6 pr-12 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            required
          />
          
          {/* 5. The Toggle Button */}
          <button
            type="button" // Important: 'button' prevents it from submitting the form!
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="w-full flex justify-end px-2">
          <Link href="#" className="text-sm text-gray-700 hover:text-primary transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button 
          type="submit"
          className="w-full mt-2 bg-primary text-white py-3.5 rounded-full font-semibold hover:bg-blue-900 transition-colors shadow-md"
        >
          Login
        </button>

      </form>

      {/* Registration Link */}
      <p className="mt-4 text-sm text-gray-700">
        Create new account? <Link href="/register" className="text-primary font-bold hover:underline">Register here.</Link>
      </p>

      {/* Social Logins */}
      <div className="mt-10 flex items-center gap-6">
        <button className="p-2 hover:scale-110 transition-transform"><GoogleIcon /></button>
        <button className="p-2 hover:scale-110 transition-transform"><FacebookIcon /></button>
        <button className="p-2 hover:scale-110 transition-transform"><AppleIcon /></button>
      </div>

    </div>
  );
}

// --- Icons ---
function GoogleIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="black">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.67.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.62 1.54-1.48 2.97-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}