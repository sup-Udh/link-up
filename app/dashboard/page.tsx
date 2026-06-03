"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Code2, Plus, Users, Clock, ChevronRight, ChevronLeft, Download, Play, CheckCircle2, User } from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { createClient } from "@/utils/supabase/client";

// Mock data for rooms
const MOCK_ROOMS = [
  { id: "rm_1", name: "Two Sum", participants: 2, lastActive: "2 mins ago", language: "Python" },
  { id: "rm_2", name: "Reverse Linked List", participants: 3, lastActive: "1 hour ago", language: "JavaScript" },
  { id: "rm_3", name: "LRU Cache", participants: 1, lastActive: "Yesterday", language: "TypeScript" },
];

export default function Dashboard() {
  const [carouselStep, setCarouselStep] = useState(0);

  const steps = [
    {
      title: "1. Install Extension",
      description: "Get the Linko Chrome extension from the web store to enable real-time collaboration directly on LeetCode.",
      icon: <Download size={24} />,
      color: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
    },
    {
      title: "2. Open a Problem",
      description: "Navigate to any LeetCode problem. The Linko extension will automatically detect the problem and your code.",
      icon: <Play size={24} />,
      color: "from-[#ffa116] to-[#ffb84d]",
      bg: "bg-orange-50 dark:bg-orange-900/20 text-[#ffa116]"
    },
    {
      title: "3. Create & Share",
      description: "Click 'Create Room' in the extension. Share the unique link with your friends to start coding together!",
      icon: <CheckCircle2 size={24} />,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
    }
  ];

  const nextStep = () => setCarouselStep((prev) => (prev + 1) % steps.length);
  const prevStep = () => setCarouselStep((prev) => (prev - 1 + steps.length) % steps.length);

  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserProfile(profile);
      }
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      
      {/* Dashboard Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffa116] to-[#ffb84d] flex items-center justify-center shadow-md">
              <Code2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">Linko Dashboard</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800"></div>
            <Link href="/profile" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:border-[#1cbaba] transition-colors overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-gray-500 dark:text-gray-400" />
                )}
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back{userProfile?.full_name ? `, ${userProfile.full_name.split(' ')[0]}` : ''}!</h1>
            <p className="text-gray-500 dark:text-gray-400">Ready to crush some LeetCode problems today?</p>
          </div>
          
          <Link href="/extension/connect" className="inline-flex items-center gap-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:border-[#1cbaba] dark:hover:border-[#1cbaba] transition-all group shrink-0">
            <Download size={16} className="text-[#1cbaba] group-hover:-translate-y-0.5 transition-transform" />
            Connect Extension
          </Link>
        </div>

        {/* Extension Setup Carousel */}
        <section className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-200 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            
            <div className="flex-1 w-full space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase">
                Getting Started
              </div>
              
              <div className="min-h-[160px]">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${steps[carouselStep].bg}`}>
                  {steps[carouselStep].icon}
                </div>
                <h2 className="text-2xl font-bold mb-3">{steps[carouselStep].title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-lg">
                  {steps[carouselStep].description}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button onClick={prevStep} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2">
                  {steps.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-2 rounded-full transition-all duration-300 ${idx === carouselStep ? 'w-8 bg-[#1cbaba]' : 'w-2 bg-gray-300 dark:bg-gray-700 cursor-pointer'}`}
                      onClick={() => setCarouselStep(idx)}
                    />
                  ))}
                </div>
                <button onClick={nextStep} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Visual Indicator of Carousel Step */}
            <div className="flex-1 w-full flex justify-center md:justify-end">
              <div className={`w-full max-w-sm aspect-video rounded-2xl bg-gradient-to-br ${steps[carouselStep].color} p-1 shadow-xl transition-all duration-500 transform scale-100`}>
                <div className="w-full h-full bg-white dark:bg-[#0a0a0a] rounded-xl flex items-center justify-center flex-col gap-4">
                   <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-inner`}>
                     {steps[carouselStep].icon}
                   </div>
                   <div className="w-32 h-3 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                   <div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-gray-900 animate-pulse"></div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Rooms Section */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Rooms</h2>
            <Link href="/room" className="hidden sm:flex items-center gap-2 bg-[#1cbaba] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#19a6a6] transition-colors shadow-md shadow-[#1cbaba]/20">
              <Plus size={18} />
              <span>Create Room</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Create Room Card */}
            <Link href="/room" className="group h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#1cbaba] dark:hover:border-[#1cbaba] hover:bg-gray-50 dark:hover:bg-[#111] transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-[#1cbaba]/10 group-hover:text-[#1cbaba]">
                <Plus size={24} className="text-gray-400 group-hover:text-[#1cbaba]" />
              </div>
              <span className="font-semibold text-gray-500 dark:text-gray-400 group-hover:text-[#1cbaba]">Start new session</span>
            </Link>

            {/* Mock Rooms */}
            {MOCK_ROOMS.map(room => (
              <div key={room.id} className="h-48 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{room.language}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                      <Clock size={12} /> {room.lastActive}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-[#1cbaba] transition-colors line-clamp-1">
                    {room.name}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex -space-x-2">
                    {[...Array(room.participants)].map((_, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-[#111] flex items-center justify-center text-xs font-bold text-white shadow-sm ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-[#ffa116]' : 'bg-green-500'}`}>
                        {i === 0 ? 'U' : i === 1 ? 'A' : 'P'}
                      </div>
                    ))}
                  </div>
                  <button className="text-sm font-medium text-[#1cbaba] hover:text-[#19a6a6] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Join <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
            
          </div>
        </section>

      </main>
    </div>
  );
}
