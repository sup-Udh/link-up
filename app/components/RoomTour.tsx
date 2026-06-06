"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, ChevronRight, Check, UserPlus, Code2 } from "lucide-react";
import { useRoom } from "@/app/lib/RoomContext";

export default function RoomTour() {
  const router = useRouter();
  const { currentUser } = useRoom();
  const [step, setStep] = useState(0); // 0=Welcome, 1=Problem, 2=Editor, 3=Collab, 4=FreeExplore, 5=CTA
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 4) {
      // Free exploration timer - show CTA after 60 seconds
      timer = setTimeout(() => {
        setStep(5);
      }, 60000);
    }
    return () => clearTimeout(timer);
  }, [step]);

  const nextStep = () => setStep(s => s + 1);
  const skipTour = () => setStep(4);

  if (step === 0) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
          <div className="w-12 h-12 rounded-xl bg-[#ffa116]/10 flex items-center justify-center mb-6">
            <Sparkles size={24} className="text-[#ffa116]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--ws-text)] mb-3">Welcome to Linko!</h2>
          <p className="text-[var(--ws-text-secondary)] text-sm mb-6 leading-relaxed">
            This is a dummy room generated for the demo. Before you start coding, would you like a quick 3-step tour of the workspace?
          </p>
          <div className="flex gap-3">
            <button onClick={skipTour} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--ws-text-muted)] hover:text-[var(--ws-text)] hover:bg-[var(--ws-surface-hover)] transition-colors">
              Skip Tour
            </button>
            <button onClick={nextStep} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#ffa116] text-black hover:bg-[#ffb342] transition-colors shadow-lg shadow-[#ffa116]/20">
              Start Tour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Tour Overlays */}
      {step === 1 && (
        <div className="fixed inset-0 z-[1000] pointer-events-none">
          <div className="absolute top-0 bottom-0 left-0 w-[25vw] shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] pointer-events-auto transition-all duration-500">
            <div className="absolute top-1/2 -right-80 -translate-y-1/2 bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-2xl p-6 w-72 shadow-2xl">
              <h3 className="font-bold text-[var(--ws-text)] flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[#ffa116]/20 text-[#ffa116] flex items-center justify-center text-xs">1</span>
                Problem Description
              </h3>
              <p className="text-sm text-[var(--ws-text-secondary)] mb-4 leading-relaxed">
                Here is your imported LeetCode problem or custom problem statement. It syncs instantly for all participants.
              </p>
              <button onClick={nextStep} className="w-full py-2 bg-[#ffa116] text-black rounded-lg text-sm font-bold flex justify-center items-center gap-1">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="fixed inset-0 z-[1000] pointer-events-none">
          <div className="absolute top-0 bottom-0 left-[25vw] right-[20vw] shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] pointer-events-auto transition-all duration-500">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-2xl p-6 w-80 shadow-2xl text-center">
              <h3 className="font-bold text-[var(--ws-text)] flex items-center justify-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[#ffa116]/20 text-[#ffa116] flex items-center justify-center text-xs">2</span>
                Multiplayer Editor
              </h3>
              <p className="text-sm text-[var(--ws-text-secondary)] mb-4 leading-relaxed">
                Code together in real-time with zero latency. You can run test cases and see outputs instantly at the bottom.
              </p>
              <button onClick={nextStep} className="w-full py-2 bg-[#ffa116] text-black rounded-lg text-sm font-bold flex justify-center items-center gap-1">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="fixed inset-0 z-[1000] pointer-events-none">
          <div className="absolute top-0 bottom-0 right-0 w-[20vw] shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] pointer-events-auto transition-all duration-500">
            <div className="absolute top-1/3 -left-80 -translate-y-1/2 bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-2xl p-6 w-72 shadow-2xl">
              <h3 className="font-bold text-[var(--ws-text)] flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[#ffa116]/20 text-[#ffa116] flex items-center justify-center text-xs">3</span>
                Collaborators
              </h3>
              <p className="text-sm text-[var(--ws-text-secondary)] mb-4 leading-relaxed">
                Manage your session here. This demo room is open for anybody to join, and you can see active participants below.
              </p>
              <button onClick={skipTour} className="w-full py-2 bg-[#ffa116] text-black rounded-lg text-sm font-bold flex justify-center items-center gap-1">
                Finish Tour <Check size={16} />
              </button>
            </div>

            {/* Dummy Mock User in the Sidebar */}
            <div className="absolute top-16 left-0 right-0 p-4 animate-in fade-in slide-in-from-right-4 duration-700">
               <div className="bg-[var(--ws-surface-elevated)] rounded-xl p-3 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden">
                 <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                 <div className="flex items-center gap-3 relative z-10">
                   <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">A</div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-medium text-[var(--ws-text)] truncate">Alice (Demo)</span>
                     </div>
                     <span className="text-[11px] text-[var(--ws-text-muted)] italic flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                     </span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Modal (Step 5) */}
      {step === 5 && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#ffa116] to-[#ffb342] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,161,22,0.3)]">
              <Code2 size={32} className="text-black" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--ws-text)] mb-3">Ready to start?</h2>
            <p className="text-[var(--ws-text-secondary)] text-sm mb-8 leading-relaxed">
              You've explored the dummy room! Create an account to invite your own friends, save your code snippets, and generate custom problems.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push("/dashboard")} 
                className="w-full py-3 rounded-xl text-sm font-bold bg-[#ffa116] text-black hover:bg-[#ffb342] transition-colors shadow-lg shadow-[#ffa116]/20"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => setStep(4)} 
                className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-[var(--ws-text-muted)] hover:text-[var(--ws-text)] hover:bg-[var(--ws-surface-hover)] transition-colors"
              >
                Continue Exploring Here
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
