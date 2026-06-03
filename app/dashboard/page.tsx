"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, Clock, Download, X, Code2, Globe, Lock, Crown, TerminalSquare } from "lucide-react";
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
  require_approval: boolean;
}

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'options' | 'blank' | 'extension'>('options');
  const [creating, setCreating] = useState(false);

  // Blank Room Form State
  const [roomTitle, setRoomTitle] = useState("");
  const [roomLanguage, setRoomLanguage] = useState("JavaScript");
  const [isPrivate, setIsPrivate] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      
      // Load User
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserProfile(profile);
      }

      // Load Rooms
      try {
        const res = await fetch('/api/rooms');
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (err) {
        console.error("Failed to load rooms", err);
      } finally {
        setLoadingRooms(false);
      }
    }
    loadData();
  }, []);

  const handleCreateBlankRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: roomTitle || "Untitled Session",
          language: roomLanguage,
          source: "blank",
          requireApproval
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        window.location.href = `/room/${data.roomId}`;
      }
    } catch (err) {
      console.error(err);
      setCreating(false);
    }
  };

  const openModal = () => {
    setModalView('options');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRoomTitle("");
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#ffa116] to-[#ffb84d] flex items-center justify-center">
              <Code2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Linko</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800"></div>
            <Link href="/profile" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:border-[#1cbaba] transition-colors overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700"></div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back{userProfile?.full_name ? `, ${userProfile.full_name.split(' ')[0]}` : ''}!</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your collaborative coding sessions.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/extension/connect" className="inline-flex items-center gap-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:border-[#1cbaba] dark:hover:border-[#1cbaba] transition-all text-gray-700 dark:text-gray-300 group shrink-0">
              <Download size={16} className="text-[#1cbaba] group-hover:-translate-y-0.5 transition-transform" />
              Get Extension
            </Link>
            <button onClick={openModal} className="inline-flex items-center gap-2 bg-[#1cbaba] hover:bg-[#19a6a6] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#1cbaba]/20 transition-all active:scale-95 shrink-0">
              <Plus size={18} />
              Create Room
            </button>
          </div>
        </div>

        {/* Rooms Section */}
        {loadingRooms ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-800 border-t-[#1cbaba] rounded-full animate-spin"></div>
          </div>
        ) : rooms.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
              <TerminalSquare size={32} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Sessions Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
              Start your first collaborative coding session by creating a blank room or importing a problem from the extension.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => { setModalView('blank'); setIsModalOpen(true); }} className="px-6 py-3 bg-[#1cbaba] hover:bg-[#19a6a6] text-white rounded-xl font-semibold shadow-md shadow-[#1cbaba]/20 transition-all active:scale-95">
                Create Blank Room
              </button>
              <button onClick={() => { setModalView('extension'); setIsModalOpen(true); }} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold transition-all active:scale-95">
                Create From Extension
              </button>
            </div>
          </div>
        ) : (
          /* Room Cards */
          <div>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Recent Rooms <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">{rooms.length}</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rooms.map(room => (
                <Link href={`/room/${room.id}`} key={room.id} className="group bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:border-[#1cbaba] dark:hover:border-[#1cbaba] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {room.source === 'extension' ? (
                        <span className="px-2.5 py-1 rounded-md bg-[#ffa116]/10 text-[#ffa116] text-xs font-semibold flex items-center gap-1.5">
                          <Code2 size={12} /> LeetCode Session
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-500 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5">
                          <TerminalSquare size={12} /> Blank Session
                        </span>
                      )}
                    </div>
                    {room.is_active ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></span> Offline
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-1 group-hover:text-[#1cbaba] transition-colors line-clamp-1 flex items-center gap-2">
                    <Crown size={18} className="text-[#ffa116] shrink-0" />
                    {room.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-1">{room.language}</p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} /> {room.participant_count} Participants
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} /> {timeAgo(room.last_active_at)}
                    </div>
                  </div>

                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* CREATE ROOM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold">
                {modalView === 'options' ? 'Create Room' : modalView === 'blank' ? 'Blank Room' : 'Import from Extension'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* View: Options */}
            {modalView === 'options' && (
              <div className="p-6 space-y-3">
                <button onClick={() => setModalView('blank')} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[#1cbaba] dark:hover:border-[#1cbaba] bg-gray-50 dark:bg-[#0a0a0a] hover:bg-[#1cbaba]/5 dark:hover:bg-[#1cbaba]/10 transition-all text-left group">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <TerminalSquare size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Create Blank Room</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Start an empty collaborative session for pair programming or interviews.</p>
                  </div>
                </button>

                <button onClick={() => setModalView('extension')} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[#ffa116] dark:hover:border-[#ffa116] bg-gray-50 dark:bg-[#0a0a0a] hover:bg-[#ffa116]/5 dark:hover:bg-[#ffa116]/10 transition-all text-left group">
                  <div className="w-12 h-12 rounded-xl bg-[#ffa116]/10 text-[#ffa116] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Code2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Import From Extension</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Launch a session directly from any LeetCode problem page.</p>
                  </div>
                </button>
              </div>
            )}

            {/* View: Blank Room Form */}
            {modalView === 'blank' && (
              <form onSubmit={handleCreateBlankRoom} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Room Name</label>
                  <input 
                    type="text" 
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                    placeholder="e.g. System Design Mock" 
                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1cbaba] focus:ring-1 focus:ring-[#1cbaba] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Language</label>
                  <select 
                    value={roomLanguage}
                    onChange={(e) => setRoomLanguage(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1cbaba] transition-all appearance-none"
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setIsPrivate(false)} className={`py-3 rounded-xl border text-sm font-semibold flex justify-center items-center gap-2 transition-colors ${!isPrivate ? 'border-[#1cbaba] bg-[#1cbaba]/10 text-[#1cbaba]' : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-[#0a0a0a]'}`}>
                    <Globe size={16} /> Public
                  </button>
                  <button type="button" onClick={() => setIsPrivate(true)} className={`py-3 rounded-xl border text-sm font-semibold flex justify-center items-center gap-2 transition-colors ${isPrivate ? 'border-[#1cbaba] bg-[#1cbaba]/10 text-[#1cbaba]' : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-[#0a0a0a]'}`}>
                    <Lock size={16} /> Private
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800">
                  <div>
                    <div className="text-sm font-semibold">Require Join Approval</div>
                    <div className="text-xs text-gray-500">You must approve guests.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={requireApproval} onChange={(e) => setRequireApproval(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#1cbaba]"></div>
                  </label>
                </div>

                <button type="submit" disabled={creating} className="w-full bg-[#1cbaba] hover:bg-[#19a6a6] text-white py-3.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center">
                  {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Create Blank Room'}
                </button>
              </form>
            )}

            {/* View: Extension Import */}
            {modalView === 'extension' && (
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#ffa116]/10 flex items-center justify-center mx-auto mb-4">
                  <Code2 size={32} className="text-[#ffa116]" />
                </div>
                <h3 className="font-bold text-lg mb-2">Waiting for extension...</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Open a LeetCode problem and create a room using the Linko Extension. The room will automatically appear in your dashboard.
                </p>
                
                <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4 text-left border border-gray-200 dark:border-gray-800 space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold flex items-center justify-center shrink-0">1</div>
                    <span>Open any LeetCode problem.</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold flex items-center justify-center shrink-0">2</div>
                    <span>Open the Linko extension.</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold flex items-center justify-center shrink-0">3</div>
                    <span>Click <strong>Start Session</strong>.</span>
                  </div>
                </div>

                <Link href="/extension/connect" onClick={closeModal} className="text-sm text-[#1cbaba] hover:underline font-semibold">
                  Don't have the extension connected?
                </Link>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
