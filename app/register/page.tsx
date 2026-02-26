"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to your backend to create a user.
    // For the MVP, we will automatically log them in after registering.
    Cookies.set("auth-token", "valid-token", { expires: 1 });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F1F5F9]">
      
      <h1 className="text-2xl font-medium text-gray-800 mb-6">Register an account</h1>

      {/* Main Card */}
      <div className="w-full max-w-md bg-primary rounded-3xl p-10 shadow-xl text-center">
        
        <p className="text-white text-lg font-medium mb-8">
          Create your free account now
        </p>

        {/* Social Buttons */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button className="bg-white flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-gray-700 hover:bg-gray-100 transition-colors">
            <GoogleIcon /> Google
          </button>
          <button className="bg-[#1877F2] p-2.5 rounded-full hover:bg-blue-600 transition-colors">
            <FacebookIcon />
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 text-white/50 text-sm mb-8">
          <div className="flex-1 h-px bg-white/20"></div>
          <span>or</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full bg-white text-gray-900 placeholder-gray-500 px-6 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium"
            required
          />
          
          <input 
            type="password" 
            placeholder="Write your password here" 
            className="w-full bg-white text-gray-900 placeholder-gray-500 px-6 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium"
            required
          />

          <button 
            type="submit"
            className="w-full mt-4 bg-[#6096BA] text-white py-3.5 rounded-full font-bold hover:bg-[#4A7F9D] transition-colors shadow-md"
          >
            Start for free
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-sm text-white/80">
          Already Registered? <Link href="/login" className="text-white font-bold hover:underline">Login here.</Link>
        </p>
      </div>
    </div>
  );
}

// --- Icons (Same as Login, but sized for the buttons) ---
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}