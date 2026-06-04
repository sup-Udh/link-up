"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Code2, User, Award, Hash, Clock, FolderGit2, Calendar, LayoutGrid, CheckCircle2, ChevronRight, LogOut } from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { createClient } from "@/utils/supabase/client";

const MOCK_ACTIVITY = [
  { id: 1, type: "solve", title: "Two Sum", lang: "Python", time: "2 hours ago", status: "Success" },
  { id: 2, type: "room", title: "Reverse Linked List", lang: "JavaScript", time: "Yesterday", status: "Collaborated" },
  { id: 3, type: "solve", title: "LRU Cache", lang: "TypeScript", time: "3 days ago", status: "Success" },
  { id: 4, type: "solve", title: "Valid Parentheses", lang: "C++", time: "1 week ago", status: "Success" },
];

export default function Profile() {
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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 pb-20">
      
      {/* Profile Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffa116] to-[#ffb84d] flex items-center justify-center shadow-md">
                <Code2 size={18} className="text-white" />
              </div>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 font-medium">
              <Link href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</Link>
              <ChevronRight size={14} className="text-gray-300 dark:text-gray-700" />
              <span className="text-gray-900 dark:text-white">Profile</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        
        {/* Profile Header Card */}
        <section className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
          <div className="h-32 md:h-48 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-pink-900/40 relative">
             <div className="absolute inset-0 bg-white/20 dark:bg-black/20 mix-blend-overlay"></div>
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
                    <span className="flex items-center gap-1 text-sm"><Calendar size={14} /> Joined {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'June 2026'}</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3">
                <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold rounded-xl transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-center md:text-left max-w-2xl text-lg font-light">
              Building the future of collaborative coding. Passionate about algorithms, distributed systems, and clean UI design.
            </p>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left Column: Stats */}
          <div className="md:col-span-1 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Award size={20} className="text-[#ffa116]" /> Statistics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-1 transition-colors">
                <span className="text-3xl font-bold text-[#1cbaba]">42</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Problems<br/>Solved</span>
              </div>
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-1 transition-colors">
                <span className="text-3xl font-bold text-indigo-500">12</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rooms<br/>Created</span>
              </div>
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-1 col-span-2 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                   <Clock size={16} className="text-[#ffa116]" />
                   <span className="text-2xl font-bold">14 hrs</span>
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time Collaborating</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-6 rounded-2xl transition-colors">
               <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Top Languages</h3>
               <div className="space-y-4">
                 <div>
                   <div className="flex justify-between text-sm mb-1"><span>Python</span> <span className="font-medium">60%</span></div>
                   <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-sm mb-1"><span>JavaScript</span> <span className="font-medium">30%</span></div>
                   <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-yellow-400 rounded-full" style={{ width: '30%' }}></div>
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-sm mb-1"><span>C++</span> <span className="font-medium">10%</span></div>
                   <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-pink-500 rounded-full" style={{ width: '10%' }}></div>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <LayoutGrid size={20} className="text-blue-500" /> Recent Activity
            </h2>

            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden transition-colors">
              <ul className="divide-y divide-gray-100 dark:divide-white/5">
                {MOCK_ACTIVITY.map((activity) => (
                  <li key={activity.id} className="p-6 hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors flex items-start gap-4 cursor-pointer group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${activity.type === 'solve' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {activity.type === 'solve' ? <CheckCircle2 size={20} /> : <FolderGit2 size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-[#1cbaba] transition-colors">
                          {activity.title}
                        </h3>
                        <span className="text-xs text-gray-400 font-medium">{activity.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5"><Hash size={14}/> {activity.lang}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                        <span className="font-medium text-gray-600 dark:text-gray-300">{activity.status}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#0a0a0a] text-center">
                <button className="text-sm font-semibold text-[#1cbaba] hover:text-[#19a6a6] transition-colors">
                  View All Activity
                </button>
              </div>
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
}
