"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Code2, Users, ChevronRight, Check, ArrowDown } from "lucide-react";
import CinematicHero from "./components/CinematicHero";
import ScrollStory from "./components/ScrollStory";
import { ThemeToggle } from "./components/ThemeToggle";
import { GithubIcon } from "./components/GithubIcon";

export default function Home() {
  const router = useRouter();

  const createRoom = () => {
    const roomId = crypto.randomUUID().slice(0, 8);
    router.push(`/room/${roomId}?slug=two-sum`);
  };

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
            Linko
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
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
              onClick={createRoom}
              className="px-8 py-4 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 font-bold rounded-lg transition-all shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
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
              <p className="text-[#ffa116] font-medium mb-4">Full Stack Engineer</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Specializes in real-time collaborative systems, backend architecture, and high-performance WebSockets.
              </p>
            </div>

            {/* Ansh Card */}
            <div className="bg-gray-50/70 dark:bg-[#1e1e1e]/70 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-colors duration-300 hover:border-[#2cbb5d]/50 group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2cbb5d] to-[#6ee7b7] p-1 mb-6 shadow-lg shadow-[#2cbb5d]/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-white dark:bg-[#1e1e1e] flex items-center justify-center text-3xl font-bold text-[#2cbb5d]">A</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ansh</h3>
              <p className="text-[#2cbb5d] font-medium mb-4">Frontend Engineer</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Focuses on building beautiful, cinematic user interfaces and robust multiplayer editor experiences.
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
    </main>
  );
}
