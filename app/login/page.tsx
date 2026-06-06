"use client";

import Link from "next/link";
import { Code2, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { createClient } from "@/utils/supabase/client";

export default function Login() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 transition-colors duration-300 relative overflow-hidden p-6">
      
      {/* Background Gradients for Premium Look */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#1cbaba]/10 dark:bg-[#1cbaba]/5 rounded-full blur-[100px] pointer-events-none transition-colors" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#ffa116]/10 dark:bg-[#ffa116]/5 rounded-full blur-[100px] pointer-events-none transition-colors" />

      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Top Navigation */}
      <div className="absolute top-0 w-full flex items-center justify-between p-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium text-sm">Back to home</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#111] rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-white/10 p-10 flex flex-col items-center transition-colors duration-300">
        
        {/* Logo */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffa116] to-[#ffb84d] shadow-lg mb-6 shadow-[#ffa116]/20">
          <Code2 size={32} className="text-white" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center transition-colors">
          Welcome to Linko
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-10 transition-colors">
          Sign in to collaborate, track your progress, and build your profile.
        </p>

        {/* Google Auth Button */}
        <button onClick={handleGoogleLogin} className="w-full relative flex items-center justify-center gap-3 bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-6 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-[#222] hover:shadow-md transition-all active:scale-95 group overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gray-100/30 dark:via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          
          <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          
          <span className="relative z-10 tracking-tight">Continue with Google</span>
        </button>

        {/* Footer info */}
        <p className="mt-8 text-xs text-center text-gray-400 dark:text-gray-500 max-w-[280px]">
          By continuing, you agree to Linko's <a href="#" className="underline hover:text-gray-600 dark:hover:text-gray-300">Terms of Service</a> and <a href="#" className="underline hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</a>.
        </p>
      </div>

    </main>
  );
}
