"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Clock,
  Download,
  X,
  Code2,
  Globe,
  Lock,
  Crown,
  TerminalSquare,
  Trash2,
  Puzzle,
} from "lucide-react";
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
  const [isExtensionLive, setIsExtensionLive] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"options" | "blank" | "extension">(
    "options",
  );
  const [creating, setCreating] = useState(false);
  
  // Delete Modal State
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Install Modal State
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showBetaBanner, setShowBetaBanner] = useState(true);

  // Blank Room Form State
  const [roomTitle, setRoomTitle] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomLanguage, setRoomLanguage] = useState("JavaScript");
  const [isPrivate, setIsPrivate] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // Load User
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setUserProfile(profile);
      }

      // Load Rooms
      try {
        const res = await fetch("/api/rooms");
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

    // Listen for extension pings
    let timeoutId: NodeJS.Timeout;
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "LINKO_EXTENSION_LIVE") {
        setIsExtensionLive(true);
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setIsExtensionLive(false), 3000);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleCreateBlankRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: roomTitle || "Untitled Session",
          language: roomLanguage,
          source: "blank",
          description: roomDescription,
          requireApproval,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        window.open(`/room/${data.roomId}`, '_blank');
        closeModal();
      }
    } catch (err) {
      console.error(err);
      setCreating(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/rooms/${roomToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRooms((prev) => prev.filter((r) => r.id !== roomToDelete.id));
        setRoomToDelete(null);
      } else {
        console.error("Failed to delete room");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const openModal = () => {
    setModalView("options");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRoomTitle("");
    setRoomDescription("");
  };

  const timeAgo = (dateString: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / 1000,
    );
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />
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
            <button
              onClick={() => setShowInstallModal(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1cbaba]/10 hover:bg-[#1cbaba]/20 text-[#1cbaba] text-sm font-medium transition-colors"
            >
              <Puzzle size={16} />
              Extension
            </button>
            <ThemeToggle />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800"></div>
            <Link
              href="/profile"
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:border-[#ffa116] transition-colors overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700"></div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-6 pb-10 space-y-8">
        {/* Beta Notice Banner */}
        {showBetaBanner && (
          <div className="bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffa116]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-3 relative z-10 pr-8">
              <span className="bg-[#ffa116] text-black px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                Beta
              </span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Linko is currently in Beta! We're actively building out new features and fine-tuning the collaborative experience.
              </span>
            </div>
            <button
              onClick={() => setShowBetaBanner(false)}
              className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors z-20"
              aria-label="Close beta banner"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back
              {userProfile?.full_name
                ? `, ${userProfile.full_name.split(" ")[0]}`
                : ""}
              !
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your collaborative coding sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isExtensionLive ? (
              <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-4 py-2.5 rounded-xl text-sm font-semibold text-green-700 dark:text-green-400 shrink-0">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                Extension Live
              </div>
            ) : (
              <Link
                href="/extension/connect"
                className="inline-flex items-center gap-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:border-[#ffa116] dark:hover:border-[#ffa116] transition-all text-gray-700 dark:text-gray-300 group shrink-0"
              >
                <Download
                  size={16}
                  className="text-[#ffa116] group-hover:-translate-y-0.5 transition-transform"
                />
                Get Extension
              </Link>
            )}
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 bg-[#ffa116] hover:bg-[#ffb342] text-black px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#ffa116]/20 transition-all active:scale-95 shrink-0"
            >
              <Plus size={18} />
              Create Room
            </button>
          </div>
        </div>

        {/* Rooms Section */}
        {loadingRooms ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-800 border-t-[#ffa116] rounded-full animate-spin"></div>
          </div>
        ) : rooms.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
              <TerminalSquare
                size={32}
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">No Sessions Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
              Start your first collaborative coding session by creating a blank
              room or importing a problem from the extension.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setModalView("blank");
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 bg-[#ffa116] hover:bg-[#ffb342] text-black rounded-xl font-semibold shadow-md shadow-[#ffa116]/20 transition-all active:scale-95"
              >
                Create Blank Room
              </button>
              <button
                onClick={() => {
                  setModalView("extension");
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold transition-all active:scale-95"
              >
                Create From Extension
              </button>
            </div>
          </div>
        ) : (
          /* Room Cards */
          <div>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              Recent Rooms{" "}
              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">
                {rooms.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rooms.map((room) => (
                <Link
                  href={`/room/${room.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={room.id}
                  className="group bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:border-[#ffa116] dark:hover:border-[#ffa116] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {room.source === "extension" ? (
                        <span className="px-2.5 py-1 rounded-md bg-[#ffa116]/10 text-[#ffa116] text-xs font-semibold flex items-center gap-1.5">
                          <Code2 size={12} /> LeetCode Session
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-500 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5">
                          <TerminalSquare size={12} /> Blank Session
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {room.participant_count > 0 ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>{" "}
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></span>{" "}
                          Offline
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRoomToDelete(room);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        aria-label="Delete room"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold mb-1 group-hover:text-[#ffa116] transition-colors line-clamp-1 flex items-center gap-2">
                    <Crown size={18} className="text-[#ffa116] shrink-0" />
                    {room.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-1">
                    {room.language}
                  </p>

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
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold">
                {modalView === "options"
                  ? "Create Room"
                  : modalView === "blank"
                    ? "Blank Room"
                    : "Import from Extension"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* View: Options */}
            {modalView === "options" && (
              <div className="p-6 space-y-3">
                <button
                  onClick={() => setModalView("blank")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[#ffa116] dark:hover:border-[#ffa116] bg-gray-50 dark:bg-[#0a0a0a] hover:bg-[#ffa116]/5 dark:hover:bg-[#ffa116]/10 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <TerminalSquare size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      Create Blank Room
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Start an empty collaborative session for pair programming
                      or interviews.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setModalView("extension")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[#ffa116] dark:hover:border-[#ffa116] bg-gray-50 dark:bg-[#0a0a0a] hover:bg-[#ffa116]/5 dark:hover:bg-[#ffa116]/10 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#ffa116]/10 text-[#ffa116] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Code2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      Import From Extension
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Launch a session directly from any LeetCode problem page.
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* View: Blank Room Form */}
            {modalView === "blank" && (
              <form onSubmit={handleCreateBlankRoom} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                    placeholder="e.g. System Design Mock"
                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffa116] focus:ring-1 focus:ring-[#ffa116] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    placeholder="e.g. Practicing graphs and dynamic programming..."
                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffa116] focus:ring-1 focus:ring-[#ffa116] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={roomLanguage}
                    onChange={(e) => setRoomLanguage(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffa116] transition-all appearance-none"
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={`py-3 rounded-xl border text-sm font-semibold flex justify-center items-center gap-2 transition-colors ${!isPrivate ? "border-[#ffa116] bg-[#ffa116]/10 text-[#ffa116]" : "border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-[#0a0a0a]"}`}
                  >
                    <Globe size={16} /> Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={`py-3 rounded-xl border text-sm font-semibold flex justify-center items-center gap-2 transition-colors ${isPrivate ? "border-[#ffa116] bg-[#ffa116]/10 text-[#ffa116]" : "border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-[#0a0a0a]"}`}
                  >
                    <Lock size={16} /> Private
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800">
                  <div>
                    <div className="text-sm font-semibold">
                      Require Join Approval
                    </div>
                    <div className="text-xs text-gray-500">
                      You must approve guests.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={requireApproval}
                      onChange={(e) => setRequireApproval(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#ffa116]"></div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-[#ffa116] hover:bg-[#ffb342] text-black py-3.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center"
                >
                  {creating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Create Blank Room"
                  )}
                </button>
              </form>
            )}

            {/* View: Extension Import */}
            {modalView === "extension" && (
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#ffa116]/10 flex items-center justify-center mx-auto mb-4">
                  <Code2 size={32} className="text-[#ffa116]" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 mt-2">
                  Open a LeetCode problem and create a room using the Linko
                  Extension. The room will automatically appear in your
                  dashboard.
                </p>

                <ExtensionAnimation />

                <Link
                  href="/extension/connect"
                  onClick={closeModal}
                  className="text-sm text-[#ffa116] hover:underline font-semibold"
                >
                  Don't have the extension connected?
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE ROOM MODAL */}
      {roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setRoomToDelete(null)}
          ></div>
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 p-6">
            <h3 className="text-xl font-bold mb-2">Delete Room?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{roomToDelete.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRoomToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors flex justify-center items-center"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Extension Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1cbaba]/10 flex items-center justify-center mb-6">
              <Puzzle size={32} className="text-[#1cbaba]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">
              Linko Chrome Extension
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">
              Unlock the full power of Linko. Start collaborative sessions directly from any LeetCode problem.
            </p>
            <div className="space-y-3">
              <a
                href="#"
                className="w-full bg-[#1cbaba] hover:bg-[#19a6a6] text-white py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2"
              >
                Download from Web Store
              </a>
              <Link
                href="/extension/connect"
                onClick={() => setShowInstallModal(false)}
                className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2"
              >
                I already have it installed
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ExtensionAnimation = () => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full mb-8">
      {/* Animated Mockup Window */}
      <div className="relative w-full h-48 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-inner mb-4">
        {/* Browser Mock Header */}
        <div className="h-8 bg-gray-100 dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 flex items-center px-3 gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
          </div>
          <div className="mx-auto w-32 h-4 bg-white dark:bg-[#222] rounded flex items-center justify-center text-[9px] text-gray-400 font-medium">
            leetcode.com
          </div>
          <div
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${step === 1 ? "bg-gray-200 dark:bg-gray-800" : ""}`}
          >
            <Code2
              size={14}
              className={step >= 2 ? "text-[#ffa116]" : "text-gray-400"}
            />
          </div>
        </div>

        {/* Browser Content */}
        <div className="p-4 relative h-full">
          {/* Step 1: LeetCode Mock UI */}
          <div
            className={`transition-opacity duration-500 ${step === 3 ? "opacity-0" : "opacity-100"}`}
          >
            <div className="w-3/4 h-4 bg-gray-100 dark:bg-gray-800 rounded mb-3"></div>
            <div className="w-1/2 h-3 bg-gray-100 dark:bg-gray-800 rounded mb-5"></div>
            <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>

          {/* Step 3: Linko Mock UI */}
          <div
            className={`absolute top-4 left-4 right-4 transition-opacity duration-500 ${step === 3 ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex flex-col items-center justify-center h-28 text-[#ffa116]">
              <div className="w-12 h-12 rounded-full bg-[#ffa116]/10 flex items-center justify-center mb-2 animate-bounce">
                <TerminalSquare size={24} />
              </div>
              <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Session Active
              </div>
            </div>
          </div>

          {/* Extension Popup Mock */}
          <div
            className={`absolute top-1 right-2 w-32 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl transition-all duration-300 transform origin-top-right ${step === 2 ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none"}`}
          >
            <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
              <Code2 size={12} className="text-[#ffa116]" />
              <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">
                Linko
              </span>
            </div>
            <div className="p-2 space-y-2">
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded"></div>
              <div className="w-3/4 h-2 bg-gray-100 dark:bg-gray-800 rounded"></div>
              <div
                className={`w-full py-1.5 mt-2 bg-[#ffa116] rounded-md text-[9px] text-center text-black font-bold shadow-sm transition-all ${step === 2 ? "opacity-100 scale-100" : "opacity-80 scale-95"}`}
              >
                Start Session
              </div>
            </div>
          </div>

          {/* Animated Cursor */}
          <div
            className="absolute z-50 transition-all duration-1000 ease-in-out pointer-events-none drop-shadow-lg"
            style={{
              top: step === 1 ? "5px" : step === 2 ? "80px" : "90px",
              left: step === 1 ? "92%" : step === 2 ? "78%" : "50%",
              transform: `translate(-50%, -50%) scale(${step === 1 ? 0.9 : step === 2 ? 0.9 : 1})`,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 4L11 20L13.5 13.5L20 11L4 4Z"
                fill="white"
                stroke="#333"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            {/* Click Ripple */}
            <div
              className={`absolute top-1 left-1 w-5 h-5 bg-[#ffa116]/40 rounded-full transition-transform duration-500 ${step === 1 || step === 2 ? "scale-150 opacity-0 animate-ping" : "scale-0 opacity-0"}`}
            ></div>
          </div>
        </div>
      </div>

      {/* Text Steps */}
      <div className="flex justify-between items-center text-left gap-2">
        <div
          className={`flex-1 p-2.5 rounded-xl transition-all duration-300 ${step === 1 ? "bg-[#ffa116]/10 text-[#ffa116] shadow-sm border border-[#ffa116]/20 scale-105" : "text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-[#0a0a0a] border border-transparent scale-100"}`}
        >
          <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5 opacity-70">
            Step 1
          </div>
          <div className="text-[11px] font-semibold leading-tight">
            Click Extension
          </div>
        </div>
        <div
          className={`flex-1 p-2.5 rounded-xl transition-all duration-300 ${step === 2 ? "bg-[#ffa116]/10 text-[#ffa116] shadow-sm border border-[#ffa116]/20 scale-105" : "text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-[#0a0a0a] border border-transparent scale-100"}`}
        >
          <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5 opacity-70">
            Step 2
          </div>
          <div className="text-[11px] font-semibold leading-tight">
            Start Room
          </div>
        </div>
        <div
          className={`flex-1 p-2.5 rounded-xl transition-all duration-300 ${step === 3 ? "bg-green-500/10 text-green-600 dark:text-green-400 shadow-sm border border-green-500/20 scale-105" : "text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-[#0a0a0a] border border-transparent scale-100"}`}
        >
          <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5 opacity-70">
            Step 3
          </div>
          <div className="text-[11px] font-semibold leading-tight">
            It's Working!
          </div>
        </div>
      </div>
    </div>
  );
};
