"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Code2, User, Award, Hash, Clock, FolderGit2, Calendar, LayoutGrid, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";

interface Room {
  id: string;
  title: string;
  source: string;
  language: string;
  participant_count: number;
  last_active_at: string;
  is_active: boolean;
}

export default function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) {
          setError("User not found");
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        setUserProfile(data.profile);
        setRooms(data.rooms);
      } catch (err) {
        console.error("Failed to load public profile", err);
        setError("Failed to load profile");
      }

      setLoading(false);
    }
    loadData();
  }, [id]);

  const timeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-800 border-t-[#ffa116] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center text-center px-6">
         <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4">
           <User size={32} className="text-gray-400 dark:text-gray-500" />
         </div>
         <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Profile Not Found</h1>
         <p className="text-gray-500 dark:text-gray-400 mb-6">The user profile you are looking for does not exist or has been removed.</p>
         <Link href="/" className="px-6 py-2.5 bg-[#ffa116] hover:bg-[#ffb342] text-black font-bold rounded-xl transition-colors">
           Return Home
         </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 pb-20 relative overflow-hidden">
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40 z-0" />

      {/* Profile Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffa116] to-[#ffb84d] flex items-center justify-center shadow-md">
                <Code2 size={18} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">Linko</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 font-medium">
              <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
              <ChevronRight size={14} className="text-gray-300 dark:text-gray-700" />
              <span className="text-gray-900 dark:text-white">User Profile</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8 relative z-10">
        
        {/* Profile Header Card */}
        <section className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
          
          {/* Banner Image or Gradient Fallback */}
          <div className="h-32 md:h-56 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-pink-900/40 relative">
             {userProfile?.banner_url ? (
               <img src={userProfile.banner_url} alt="Profile Banner" className="w-full h-full object-cover mix-blend-normal" />
             ) : (
               <div className="absolute inset-0 bg-white/20 dark:bg-black/20 mix-blend-overlay"></div>
             )}
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 md:-mt-20 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                {/* Avatar */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-[#111] bg-gray-100 dark:bg-gray-800 shadow-xl flex items-center justify-center relative overflow-hidden z-10 transition-colors">
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-gray-400 dark:text-gray-600" />
                  )}
                </div>
                
                <div className="text-center md:text-left space-y-1 mb-2">
                  <h1 className="text-3xl font-bold">{userProfile?.full_name || 'Linko Developer'}</h1>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2">
                    @{userProfile?.email?.split('@')[0] || 'linkodev'} <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span> 
                    <span className="flex items-center gap-1 text-sm">
                      <Calendar size={14} /> Joined {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Loading...'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-center md:text-left max-w-2xl text-lg font-light leading-relaxed">
              {userProfile?.bio || "Building the future of collaborative coding. Passionate about algorithms, distributed systems, and clean UI design."}
            </p>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left Column: Stats */}
          <div className="md:col-span-1 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Award size={20} className="text-[#ffa116]" /> Statistics
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-colors">
                <span className="text-4xl font-bold text-[#ffa116]">{rooms.length}</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rooms Created</span>
              </div>
              
              <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                   <Clock size={20} className="text-blue-500" />
                   <span className="text-3xl font-bold">~{Math.max(1, Math.round(rooms.length * 1.5))} hrs</span>
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time Collaborating</span>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <LayoutGrid size={20} className="text-blue-500" /> Recent Activity
            </h2>

            <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden transition-colors">
              {rooms.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  <p>No recent activity found for this user.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-white/5">
                  {rooms.slice(0, 5).map((room) => (
                    <li key={room.id} className="p-6 flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${room.source === 'extension' ? 'bg-[#ffa116]/10 text-[#ffa116]' : 'bg-blue-500/10 text-blue-500'}`}>
                        {room.source === 'extension' ? <Code2 size={20} /> : <FolderGit2 size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {room.title}
                          </h3>
                          <span className="text-xs text-gray-400 font-medium">{timeAgo(room.last_active_at)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1.5"><Hash size={14}/> {room.language}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                          <span className="font-medium text-gray-600 dark:text-gray-300">
                            {room.participant_count > 0 ? `${room.participant_count} Participants` : 'Solo Session'}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
