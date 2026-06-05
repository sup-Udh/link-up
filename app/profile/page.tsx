"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Code2, User, Pencil, Award, Hash, Clock, FolderGit2, Calendar, LayoutGrid, CheckCircle2, ChevronRight, LogOut, Check, X, Upload, Share2 } from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { createClient } from "@/utils/supabase/client";

interface Room {
  id: string;
  title: string;
  source: string;
  language: string;
  participant_count: number;
  last_active_at: string;
  is_active: boolean;
}

export default function Profile() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTimeMs, setTotalTimeMs] = useState(0);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [bannerInput, setBannerInput] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      
      // Load User and Metadata
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const mergedProfile = { ...profile, ...user.user_metadata, created_at: user.created_at, id: user.id };
        setUserProfile(mergedProfile);
        setBioInput(mergedProfile.bio || "");
        setBannerInput(mergedProfile.banner_url || "");
        
        // Fetch Real User Sessions
        const { data: sessions } = await supabase.from('user_sessions').select('joined_at, left_at').eq('user_id', user.id).not('left_at', 'is', null);
        if (sessions) {
          const totalMs = sessions.reduce((acc: number, s: any) => acc + (new Date(s.left_at).getTime() - new Date(s.joined_at).getTime()), 0);
          setTotalTimeMs(totalMs);
        }
      }

      // Load Rooms for Activity
      try {
        const res = await fetch("/api/rooms");
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (err) {
        console.error("Failed to load rooms", err);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let finalBannerUrl = bannerInput;

      // If a new file was selected, upload it first
      if (bannerFile) {
        const formData = new FormData();
        formData.append("file", bannerFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalBannerUrl = uploadData.url;
        } else {
          console.error("Failed to upload image");
        }
      }

      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: bioInput, bannerUrl: finalBannerUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile((prev: any) => ({
          ...prev,
          bio: data.user.user_metadata.bio,
          banner_url: data.user.user_metadata.banner_url,
        }));
        setBannerInput(data.user.user_metadata.banner_url || "");
        setBannerFile(null);
        setBannerPreview(null);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

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

  const handleShare = () => {
    if (userProfile?.id) {
      const url = `${window.location.origin}/profile/${userProfile.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTotalTime = (ms: number) => {
    if (ms === 0) return "0 min";
    const hours = ms / (1000 * 60 * 60);
    if (hours < 1) {
      const mins = Math.max(1, Math.round(ms / (1000 * 60)));
      return `${mins} min`;
    }
    return `${hours.toFixed(1)} hrs`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 pb-20 relative overflow-hidden">
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40 z-0" />

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

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8 relative z-10">
        
        {/* Profile Header Card */}
        <section className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
          
          {/* Banner Image or Gradient Fallback */}
          <div className="h-32 md:h-56 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-pink-900/40 relative">
             {(bannerPreview || userProfile?.banner_url) ? (
               <img src={bannerPreview || userProfile.banner_url} alt="Profile Banner" className="w-full h-full object-cover mix-blend-normal" />
             ) : (
               <div className="absolute inset-0 bg-white/20 dark:bg-black/20 mix-blend-overlay"></div>
             )}
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 md:-mt-20 mb-4 relative z-20">
              {/* Avatar */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-[#111] bg-gray-100 dark:bg-gray-800 shadow-xl flex items-center justify-center relative overflow-hidden z-10 transition-colors mx-auto sm:mx-0 shrink-0">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-gray-400 dark:text-gray-600" />
                )}
              </div>

              {/* Sleek Actions */}
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 mt-2 sm:mb-4 shrink-0">
                {!isEditing ? (
                  <>
                    <button onClick={handleShare} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 font-medium rounded-full shadow-sm hover:shadow-md transition-all text-sm group sm:w-[105px]" title="Share Public Profile">
                      <Share2 size={15} className="text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors shrink-0" /> 
                      <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
                    </button>
                    <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:border-[#ffa116] dark:hover:border-[#ffa116] text-gray-700 dark:text-gray-300 font-medium rounded-full shadow-sm hover:shadow-md transition-all text-sm group sm:w-[95px]" title="Edit Profile">
                      <Pencil size={15} className="text-gray-500 dark:text-gray-400 group-hover:text-[#ffa116] transition-colors shrink-0" /> 
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(false)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:border-gray-400 text-gray-700 dark:text-gray-300 font-medium rounded-full shadow-sm hover:shadow-md transition-all text-sm sm:w-[105px]">
                    <X size={15} className="shrink-0" /> <span className="hidden sm:inline">Cancel</span>
                  </button>
                )}
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-700 dark:text-gray-300 font-medium rounded-full shadow-sm hover:shadow-md transition-all text-sm group sm:w-[110px]" title="Sign Out">
                  <LogOut size={15} className="text-red-500 group-hover:-translate-x-0.5 transition-transform shrink-0" />
                  <span className="hidden sm:inline text-red-600 dark:text-red-400 font-semibold">Sign Out</span>
                </button>
              </div>
            </div>
            
            {/* User Info */}
            <div className="text-center sm:text-left space-y-1.5 mb-6 relative z-10">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{userProfile?.full_name || 'Linko Developer'}</h1>
              <div className="text-gray-500 dark:text-gray-400 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 font-medium">
                <span>@{userProfile?.email?.split('@')[0] || 'linkodev'}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 hidden sm:block"></span> 
                <span className="flex items-center gap-1.5 text-sm">
                  <Calendar size={14} className="shrink-0" /> Joined {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Loading...'}
                </span>
              </div>
            </div>
            
            {/* Bio Section */}
            {isEditing ? (
              <div className="space-y-4 max-w-2xl mt-4 bg-gray-50 dark:bg-[#151515] p-5 rounded-2xl border border-gray-200 dark:border-white/5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Banner Image</label>
                  <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-[#222] transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-6 h-6 mb-2 text-gray-400 group-hover:text-[#ffa116]" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium group-hover:text-[#ffa116] transition-colors">
                        {bannerFile ? bannerFile.name : "Click to upload a new banner image"}
                      </p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                  <textarea 
                    value={bioInput} 
                    onChange={(e) => setBioInput(e.target.value)} 
                    rows={3} 
                    placeholder="Tell us about your coding journey..." 
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffa116] resize-none" 
                  />
                </div>
                <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-[#ffa116] hover:bg-[#ffb342] text-black font-bold rounded-xl transition-colors disabled:opacity-70">
                  {isSaving ? <span className="animate-pulse">Saving...</span> : <><Check size={16} /> Save Profile</>}
                </button>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 text-center md:text-left max-w-2xl text-lg font-light leading-relaxed">
                {userProfile?.bio || "Building the future of collaborative coding. Passionate about algorithms, distributed systems, and clean UI design."}
              </p>
            )}
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
                   <span className="text-3xl font-bold">{formatTotalTime(totalTimeMs)}</span>
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
              {loading ? (
                <div className="p-10 flex justify-center">
                  <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-800 border-t-[#ffa116] rounded-full animate-spin"></div>
                </div>
              ) : rooms.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  <p>No recent activity found. Create a room to get started!</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-white/5">
                  {rooms.slice(0, 5).map((room) => (
                    <li key={room.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-[#151515]/50 transition-colors flex items-start gap-4 group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${room.source === 'extension' ? 'bg-[#ffa116]/10 text-[#ffa116]' : 'bg-blue-500/10 text-blue-500'}`}>
                        {room.source === 'extension' ? <Code2 size={20} /> : <FolderGit2 size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Link href={`/room/${room.id}`} className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-[#ffa116] transition-colors">
                            {room.title}
                          </Link>
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
              
              {rooms.length > 5 && (
                <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#0a0a0a] text-center">
                  <Link href="/dashboard" className="text-sm font-semibold text-[#ffa116] hover:text-[#ffb342] transition-colors">
                    View All in Dashboard
                  </Link>
                </div>
              )}
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
}
