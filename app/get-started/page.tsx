"use client";
import { ArrowRight, Download, Users, Play, Code2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { GithubIcon } from "@/app/components/GithubIcon";

export default function GetStarted() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 font-sans selection:bg-[#ffa116] selection:text-white transition-colors duration-300">
      {/* Dark Top Section */}
      <div className="relative bg-[#282828] text-white pb-32" style={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 0% 100%)" }}>
        {/* Navbar */}
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffa116] to-[#ffb84d]">
              <Code2 size={20} className="text-white" />
            </div>
            <h1 className="font-bold text-2xl tracking-tight text-white">
              Linko
            </h1>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/landing" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link href="/landing#explore" className="text-white font-bold">Explore</Link>
            <Link href="/room" className="bg-[#1cbaba] text-white px-4 py-2 rounded-md hover:bg-[#19a6a6] transition-colors shadow-lg shadow-[#1cbaba]/20">
              Try it now
            </Link>
            <a href="https://github.com/udhay-singh/linkup-leetcode" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white transition-colors">
              <GithubIcon className="w-5 h-5" />
            </a>
            <ThemeToggle />
          </div>
        </nav>

        {/* Header Content */}
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            How Linko Works
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Get your collaborative LeetCode session up and running in less than 30 seconds. Follow these simple steps to start coding with your friends.
          </p>
        </div>
      </div>

      {/* Steps Content */}
      <div className="relative -mt-16 z-10 mx-auto max-w-5xl px-6 pb-32">
        
        {/* Step 1: Extension */}
        <div className="mb-12">
          <div 
            className="flex flex-col md:flex-row items-center gap-12 bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-8 md:p-12 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xl mb-2">
                1
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Get the Extension</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed transition-colors">
                First, install the Linko Chrome Extension. Once installed, navigate to any LeetCode problem you want to solve, and click the Linko icon in your browser toolbar.
              </p>
              <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md">
                <Download size={18} /> Download for Chrome
              </button>
            </div>
            <div className="flex-1 w-full flex justify-center">
              {/* Extension Mockup */}
              <div className="relative w-64 h-80 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-white/10 shadow-inner overflow-hidden flex flex-col transition-colors">
                <div className="h-10 bg-gray-100 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-white/10 flex items-center px-3 gap-2 transition-colors">
                  <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                  <div className="flex-1 h-4 bg-white dark:bg-[#222] rounded border border-gray-200 dark:border-white/10"></div>
                  <div className="w-5 h-5 rounded bg-[#ffa116] flex items-center justify-center shadow-sm">
                    <Code2 size={12} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 p-4 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffa116] to-[#ffb84d] flex items-center justify-center shadow-lg">
                    <Code2 size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white transition-colors">Linko is ready!</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">You are on "Two Sum". Ready to collaborate?</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Create Room */}
        <div className="mb-12">
          <div 
            className="flex flex-col md:flex-row-reverse items-center gap-12 bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-8 md:p-12 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1cbaba]/20 text-[#1cbaba] font-bold text-xl mb-2">
                2
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Create a Room</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed transition-colors">
                Inside the extension popup, click on <strong>"Create Room"</strong>. The extension will magically extract the problem description, boilerplate code, and test cases, then spin up a dedicated collaborative environment for you.
              </p>
            </div>
            <div className="flex-1 w-full flex justify-center">
              {/* Button Mockup */}
              <div className="relative p-8 bg-gray-50 dark:bg-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-white/10 shadow-inner flex flex-col items-center justify-center space-y-6 w-full max-w-sm transition-colors">
                 <button className="w-full py-4 bg-[#1cbaba] text-white rounded-xl font-bold text-lg shadow-lg shadow-[#1cbaba]/30 flex items-center justify-center gap-2 transform hover:scale-105 transition-transform">
                   <Play size={20} fill="currentColor" /> Create Room
                 </button>
                 <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                   <div className="w-4 h-px bg-gray-300 dark:bg-gray-700"></div>
                   <span>or join existing</span>
                   <div className="w-4 h-px bg-gray-300 dark:bg-gray-700"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Collaborate */}
        <div>
          <div className="flex flex-col md:flex-row items-center gap-12 bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold text-xl mb-2">
                3
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Share & Code</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed transition-colors">
                You'll be redirected to your new room. Copy the URL and share it with your friend. You'll instantly see their cursor, hear their voice (coming soon), and be able to tackle the problem together in real-time!
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> Multiplayer Code Editor</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> Synced Custom Test Cases</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> Real-time Execution Engine</li>
              </ul>
            </div>
            <div className="flex-1 w-full flex justify-center">
              {/* Collaboration Mockup */}
              <div className="relative w-full max-w-sm h-64 bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-700 overflow-hidden font-mono text-xs p-4 flex flex-col">
                 <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                   <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                     <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   </div>
                   <div className="flex gap -2">
                     <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[#1e1e1e] flex items-center justify-center text-white text-[10px] font-bold z-10">U</div>
                     <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-[#1e1e1e] flex items-center justify-center text-white text-[10px] font-bold -ml-2 z-20">A</div>
                   </div>
                 </div>
                 <div className="space-y-2 flex-1">
                   <div className="text-blue-400">function <span className="text-yellow-200">solve</span>(nums) {'{'}</div>
                   <div className="pl-4 h-4 relative">
                     <span className="text-gray-300">let result = 0;</span>
                     <div className="absolute top-0 left-0 w-0.5 h-4 bg-purple-500 animate-pulse"></div>
                   </div>
                   <div className="pl-4 h-4 relative mt-2">
                     <span className="text-gray-300">return result;</span>
                     <div className="absolute top-0 left-24 w-0.5 h-4 bg-blue-500 animate-pulse"></div>
                   </div>
                   <div className="text-blue-400">{'}'}</div>
                 </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] py-12 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Code2 size={24} className="text-[#ffa116]" />
            <span className="font-bold text-gray-900 dark:text-white text-xl transition-colors">Linko</span>
          </div>
          <div className="text-sm text-gray-400">
            Made by Udhay & Ansh · © 2026
          </div>
        </div>
      </footer>
    </main>
  );
}
