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
  
  // 1. Add state to track the typed credentials
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set a generic auth token for everyone
    Cookies.set("auth-token", "valid-token", { expires: 1 });

    // BACKEND NOTE: 🚨 CRITICAL SECURITY RISK 🚨 
    // This is a hardcoded frontend mock for UI testing purposes ONLY.
    // Replace this logic! The backend MUST verify credentials against the database 
    // and securely return the user's role (admin vs user) embedded inside a JWT.
    if (username === "admin" && password === "admin") {
      Cookies.set("user-role", "admin", { expires: 1 }); 
    } else {
      Cookies.set("user-role", "user", { expires: 1 }); 
    }

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
          // 2. Bind the state to the input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-[#B8D1E6] placeholder-gray-600 text-gray-800 px-6 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
          required
        />
        
        {/* Password Field */}
        <div className="relative w-full">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Enter Password" 
            // 3. Bind the state to the input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#B8D1E6] placeholder-gray-600 text-gray-800 pl-6 pr-12 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            required
          />
          
          <button
            type="button" 
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

    </div>
  );
}