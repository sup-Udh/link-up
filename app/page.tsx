"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Code2, Users, ChevronRight, Check, ArrowDown, Puzzle, X } from "lucide-react";
import CinematicHero from "./components/CinematicHero";
import ScrollStory from "./components/ScrollStory";
import { ThemeToggle } from "./components/ThemeToggle";
import { GithubIcon } from "./components/GithubIcon";
import SetupAnimation from "./components/SetupAnimation";

export default function Home() {
  const router = useRouter();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [dummyName, setDummyName] = useState("");

  const handleStartDummyRoom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dummyName.trim()) return;
    
    const roomId = crypto.randomUUID().slice(0, 8);
    // Passing name in URL, RoomContext will save it to local storage
    window.open(`/room/${roomId}?slug=two-sum&demo=true&name=${encodeURIComponent(dummyName.trim())}`, '_blank');
    setShowNameModal(false);
    setDummyName("");
  };

  const createRoom = () => {
    setShowNameModal(true);
  };

  const DashboardReroute = () => {
    router.push("/dashboard");
  }

  const scrollToDevelopers = () => {
    document.getElementById("developers")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white flex flex-col font-sans transition-colors duration-300 relative">
      
      {/* Background Scroll Animation */}
      <ScrollStory />

      {/* Top Navigation - IDE style */}
      <nav className="h-14 border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md shrink-0 relative z-20 transition-colors duration-300">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Code2 className="text-[#ffa116]" size={24} />
            <span>Linko</span>
            <span className="bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ml-1">Beta</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowInstallModal(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1cbaba]/10 hover:bg-[#1cbaba]/20 text-[#1cbaba] text-sm font-medium transition-colors"
          >
            <Puzzle size={16} />
            Extension
          </button>
          <a href="https://github.com/sup-Udh/link-up" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <GithubIcon width={20} height={20} />
          </a>
          <ThemeToggle />
          <button 
            onClick={createRoom}
            className="px-4 py-1.5 bg-[#ffa116] hover:bg-[#ffb342] text-black rounded-md text-sm font-semibold transition-colors shadow-lg shadow-[#ffa116]/20 flex items-center gap-2"
          >
            <Users size={16} />
            New Room
          </button>
        </div>
      </nav>

      {/* Main Workspace Layout (Hero) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)] relative z-10">
        
        {/* Left Sidebar (Marketing) */}
        <div className="w-full lg:w-[480px] xl:w-[520px] p-8 lg:p-12 flex flex-col justify-center border-r border-gray-200 dark:border-white/10 bg-white/40 dark:bg-[#1e1e1e]/40 backdrop-blur-sm relative shrink-0 transition-colors duration-300">
          <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-[#ffa116]/10 rounded-full blur-[100px] pointer-events-none" />
    
          
          <h1 className="text-4xl lg:text-5xl font-medium mb-6 text-gray-900 dark:text-white">
            Code Together.<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ffa116] to-[#ffc875]">
              In Real Time.
            </span>
          </h1>
          
          <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed text-base lg:text-lg font-normal">
            Linko is a lightning-fast, multiplayer code editor designed for technical interviews, pair programming, and collaborative debugging.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button 
              // redirect to dashboard
              onClick={DashboardReroute}

              className="px-8 py-4 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 font-bold rounded-lg transition-all shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
            >
              Start Coding
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
            <div className="flex items-center gap-6 text-gray-500 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" />
                Zero setup
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" />
                Instant share
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" />
                Interactive
              </div>
            </div>
          </div>
        </div>

        {/* Right Area (Cinematic Demo) */}
        <div className="flex-1 bg-gray-100/40 dark:bg-[#121212]/40 backdrop-blur-sm relative p-4 lg:p-8 flex flex-col items-center justify-center overflow-hidden transition-colors duration-300">
          <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-[#ffa116]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="w-full max-w-6xl">
            <CinematicHero />
          </div>

          <button 
            onClick={scrollToDevelopers}
            className="mt-6 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-semibold transition-all flex flex-col items-center gap-1.5 group"
          >
            Scroll Down
            <ArrowDown size={14} className="animate-bounce" />
          </button>
        </div>
        
      </div>

      {/* How It Works Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-8 relative z-10">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">How Linko Works</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Get started with collaborative coding in 3 simple steps. No sign-ups required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:bg-white/80 dark:hover:bg-[#1a1a1a]/80 shadow-xl shadow-black/5">
              <div className="w-16 h-16 rounded-2xl bg-[#ffa116]/10 text-[#ffa116] flex items-center justify-center mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Create a Room</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Use the Extension or the "New Room" button to generate a unique coding room. It only takes a second. synced with your LeetCode problems for seamless problem loading.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:bg-white/80 dark:hover:bg-[#1a1a1a]/80 shadow-xl shadow-black/5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Share the Link</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Send the URL to your teammate. They can join instantly with just one click, right from their browser.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:bg-white/80 dark:hover:bg-[#1a1a1a]/80 shadow-xl shadow-black/5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                <Code2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Code Together</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Write code, execute test cases, and solve LeetCode problems in real-time with zero latency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Guide Section */}
      <section className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]/50 border-t border-gray-200 dark:border-white/10 flex flex-col items-center justify-center p-8 transition-colors duration-300 relative z-10">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">Setup in Seconds</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Connecting your coding environment has never been easier. Install the extension, open a problem, and you're ready to invite collaborators.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Steps Text */}
            <div className="flex-1 space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ffa116] text-black font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Install the Extension</h3>
                  <p className="text-gray-500 dark:text-gray-400">Grab the free Linko extension from the Chrome Web Store. It's lightweight and integrates directly into your browser.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ffa116] text-black font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Open a Problem</h3>
                  <p className="text-gray-500 dark:text-gray-400">Head over to any supported platform like LeetCode and open the problem you want to solve with your peers.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ffa116] text-black font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start the Session</h3>
                  <p className="text-gray-500 dark:text-gray-400">Click the Linko extension icon and hit 'Start Session'. We'll instantly generate a real-time collaborative workspace for that exact problem.</p>
                </div>
              </div>
            </div>

            {/* Animation Pane */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center">
              <SetupAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Developers Section */}
      <section id="developers" className="min-h-screen bg-white/30 dark:bg-[#0a0a0a]/30 border-t border-gray-200 dark:border-white/10 flex flex-col items-center justify-center p-8 transition-colors duration-300 relative z-10">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Meet the Developers</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              The engineers behind Linko. We built this platform to make collaborative technical interviews and pair programming seamless, fast, and reliable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Udhay Card */}
            <div className="bg-gray-50/70 dark:bg-[#1e1e1e]/70 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-colors duration-300 hover:border-[#ffa116]/50 group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ffa116] to-[#ffc875] p-1 mb-6 shadow-lg shadow-[#ffa116]/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-white dark:bg-[#1e1e1e] flex items-center justify-center text-3xl font-bold text-[#ffa116]">U</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Udhay</h3>
              <p className="text-[#ffa116] font-medium mb-4">Full-Stack Engineer (Product & UX)</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Specializes in building robust multiplayer logic paired with beautiful, cinematic user interfaces and interactions.
              </p>
            </div>

            {/* Ansh Card */}
            <div className="bg-gray-50/70 dark:bg-[#1e1e1e]/70 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-colors duration-300 hover:border-[#2cbb5d]/50 group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2cbb5d] to-[#6ee7b7] p-1 mb-6 shadow-lg shadow-[#2cbb5d]/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-white dark:bg-[#1e1e1e] flex items-center justify-center text-3xl font-bold text-[#2cbb5d]">A</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ansh (Core & Systems)</h3>
              <p className="text-[#2cbb5d] font-medium mb-4">Full-Stack Engineer</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Specializes in end-to-end architecture, high-performance WebSockets, and scalable real-time collaborative systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 dark:border-white/10 py-10 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#050505] relative z-10 transition-colors duration-300">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-[#ffa116]" />
            <span className="font-bold text-gray-900 dark:text-white text-base">Linko</span>
          </div>
          <p>© {new Date().getFullYear()} Linko. Built for real-time collaboration.</p>
        </div>
      </footer>

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
      {/* Name Prompt Modal for Quick Start */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Start</h2>
              <button 
                onClick={() => setShowNameModal(false)}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              You're about to create a temporary dummy room. No sign-up required! What should we call you?
            </p>
            
            <form onSubmit={handleStartDummyRoom}>
              <input
                type="text"
                autoFocus
                placeholder="Enter your name..."
                value={dummyName}
                onChange={(e) => setDummyName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#ffa116] focus:ring-1 focus:ring-[#ffa116] transition-all mb-4"
              />
              <button
                type="submit"
                disabled={!dummyName.trim()}
                className="w-full py-3 bg-[#ffa116] hover:bg-[#ffb342] text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Room
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
