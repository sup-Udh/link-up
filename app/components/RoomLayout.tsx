"use client";

import dynamic from "next/dynamic";
import { RoomProvider, useRoom } from "@/app/lib/RoomContext";
import Members from "./Members";
import BottomPanel from "./BottomPanel";
import RoomControls from "./RoomControls";
import ActivityFeed from "./ActivityFeed";
import RoomTour from "./RoomTour";
import ChatPanel from "./ChatPanel";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Panel, Group, Separator } from "react-resizable-panels";
import { Code2, ShieldAlert, Loader2, RefreshCw, ArrowLeft, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";

function ResizeHandle({ direction = "horizontal" }: { direction?: "horizontal" | "vertical" }) {
  return (
    <Separator className={`relative flex items-center justify-center transition-colors group
      ${direction === "horizontal" 
        ? "w-[3px] cursor-col-resize z-10 bg-transparent hover:bg-[var(--ws-accent)]/20 active:bg-[var(--ws-accent)]/40" 
        : "h-[3px] cursor-row-resize z-10 bg-transparent hover:bg-[var(--ws-accent)]/20 active:bg-[var(--ws-accent)]/40"
      }
    `}>
      <div className={`rounded-full transition-all opacity-0 group-hover:opacity-100 bg-[var(--ws-accent)]/50 ${direction === "horizontal" ? "w-[1px] h-6" : "h-[1px] w-6"}`} />
    </Separator>
  );
}

const Editor = dynamic(() => import("./Editors"), { ssr: false });

function IdentityModal() {
  const { setIdentity } = useRoom();
  const [name, setName] = useState("");
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50">
      <div className="bg-[var(--ws-surface-elevated)]/95 backdrop-blur-2xl p-8 rounded-2xl w-[340px] shadow-2xl border border-[var(--ws-border)]">
        
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--ws-accent)] to-[#ffb84d] flex items-center justify-center shadow-lg shadow-[var(--ws-accent-glow)]">
            <Code2 size={20} className="text-black" />
          </div>
        </div>

        <h2 className="text-[var(--ws-text)] text-lg font-semibold text-center mb-1">Join Session</h2>
        <p className="text-[var(--ws-text-muted)] text-sm text-center mb-6">Enter your display name to continue</p>
        
        <input 
          type="text" 
          value={name} 
          onChange={e=>setName(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && name.trim().length >= 2 && setIdentity(name)}
          className="w-full bg-[var(--ws-surface)] border border-[var(--ws-border)] text-[var(--ws-text)] px-4 py-3 rounded-xl mb-4 focus:border-[var(--ws-accent)] focus:ring-1 focus:ring-[var(--ws-accent)]/20 focus:outline-none transition-colors text-sm placeholder:text-[var(--ws-text-muted)]" 
          placeholder="Your name..." 
          autoFocus
        />
        
        <button 
          onClick={() => name.trim().length >= 2 && setIdentity(name)} 
          disabled={name.trim().length < 2}
          className="w-full bg-gradient-to-r from-[var(--ws-accent)] to-[#ffb84d] text-black py-3 rounded-xl font-semibold text-sm hover:from-[var(--ws-accent-hover)] hover:to-[#ffd280] transition-all shadow-[0_0_16px_var(--ws-accent-glow)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Join Session
        </button>
      </div>
    </div>
  );
}

function RoomContent({ problemPanel }: { problemPanel: React.ReactNode }) {
  const { identityStatus, joinStatus, notifications } = useRoom();

  if (identityStatus === "missing") {
    return <IdentityModal />;
  }

  if (joinStatus === "waiting-approval") {
    return (
      <div className="flex h-screen bg-[var(--ws-bg)] items-center justify-center flex-col gap-5 text-center p-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[var(--ws-accent)]/10 blur-2xl scale-150" />
          <div className="relative w-14 h-14 border-[3px] border-[var(--ws-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="space-y-2">
          <h1 className="text-[var(--ws-text)] text-xl font-semibold">Waiting for approval</h1>
          <p className="text-[var(--ws-text-muted)] text-sm max-w-xs">The host needs to approve your request before you can join this session.</p>
        </div>
        <button onClick={() => window.location.href = "/"} className="mt-2 px-5 py-2 bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] hover:bg-[var(--ws-surface-hover)] text-[var(--ws-text-secondary)] rounded-lg text-sm font-medium transition-colors">
          Cancel
        </button>
      </div>
    );
  }

  if (joinStatus === "rejected") {
    return (
      <div className="flex h-screen bg-[var(--ws-bg)] items-center justify-center flex-col gap-5 text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <ShieldAlert size={28} className="text-red-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-red-400 text-xl font-semibold">Request Declined</h1>
          <p className="text-[var(--ws-text-muted)] text-sm max-w-xs">Your join request was declined by the host.</p>
        </div>
        <div className="flex gap-3 mt-2">
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-5 py-2 bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] hover:bg-[var(--ws-surface-hover)] text-[var(--ws-text-secondary)] rounded-lg text-sm font-medium transition-colors">
            <RefreshCw size={14} /> Retry
          </button>
          <button onClick={() => window.location.href = "/"} className="flex items-center gap-2 px-5 py-2 bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] hover:bg-[var(--ws-surface-hover)] text-[var(--ws-text-secondary)] rounded-lg text-sm font-medium transition-colors">
            <ArrowLeft size={14} /> Leave
          </button>
        </div>
      </div>
    );
  }

  if (joinStatus === "kicked") {
    return (
      <div className="flex h-screen bg-[var(--ws-bg)] items-center justify-center flex-col gap-5 text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <ShieldAlert size={28} className="text-red-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-red-400 text-xl font-semibold">Removed from Session</h1>
          <p className="text-[var(--ws-text-muted)] text-sm max-w-xs">You have been removed from this room by the host.</p>
        </div>
        <div className="flex gap-3 mt-2">
          <button onClick={() => window.location.href = "/dashboard"} className="flex items-center gap-2 px-5 py-2 bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] hover:bg-[var(--ws-surface-hover)] text-[var(--ws-text-secondary)] rounded-lg text-sm font-medium transition-colors">
            <ArrowLeft size={14} /> Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (joinStatus === "ended") {
    return (
      <div className="flex h-screen bg-[var(--ws-bg)] items-center justify-center flex-col gap-5 text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-[var(--ws-surface-hover)] flex items-center justify-center border border-[var(--ws-border)]">
          <ShieldAlert size={28} className="text-[var(--ws-text-muted)]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-[var(--ws-text)] text-xl font-semibold">Session Ended</h1>
          <p className="text-[var(--ws-text-muted)] text-sm max-w-xs">This session has been permanently ended by the host.</p>
        </div>
        <div className="flex gap-3 mt-2">
          <button onClick={() => window.location.href = "/dashboard"} className="flex items-center gap-2 px-5 py-2 bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] hover:bg-[var(--ws-surface-hover)] text-[var(--ws-text-secondary)] rounded-lg text-sm font-medium transition-colors">
            <ArrowLeft size={14} /> Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (joinStatus === "connecting") {
    return (
      <div className="flex h-screen bg-[var(--ws-bg)] items-center justify-center flex-col relative overflow-hidden">
        <div className="relative w-64 h-64 flex items-center justify-center">
          
          {/* LeetCode Icon */}
          <motion.div
            className="absolute"
            initial={{ x: -100, y: -100, opacity: 0, scale: 0.5 }}
            animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#ffa116]/20 flex items-center justify-center border border-[#ffa116]/30">
              <Code2 size={20} className="text-[#ffa116]" />
            </div>
          </motion.div>

          {/* HackerRank Icon */}
          <motion.div
            className="absolute"
            initial={{ x: 100, y: -100, opacity: 0, scale: 0.5 }}
            animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#2ebd59]/20 flex items-center justify-center border border-[#2ebd59]/30">
              <TerminalSquare size={20} className="text-[#2ebd59]" />
            </div>
          </motion.div>

          {/* Codeforces Icon */}
          <motion.div
            className="absolute"
            initial={{ x: 0, y: 120, opacity: 0, scale: 0.5 }}
            animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#1f8bcb]/20 flex items-center justify-center border border-[#1f8bcb]/30">
              <span className="text-[#1f8bcb] font-bold text-xs">CF</span>
            </div>
          </motion.div>

          {/* Linko Logo (Center) */}
          <motion.div 
            className="z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffa116] to-[#ffb84d] flex items-center justify-center shadow-[0_0_30px_rgba(255,161,22,0.3)]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Code2 size={32} className="text-white" />
          </motion.div>
        </div>

        <motion.p 
          className="text-[var(--ws-text-muted)] text-sm font-medium mt-4 tracking-widest uppercase"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Initializing Workspace...
        </motion.p>
      </div>
    );
  }

  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [timeLimitReached, setTimeLimitReached] = useState(false);

  useEffect(() => {
    if (isDemo) {
      const timer = setTimeout(() => {
        setTimeLimitReached(true);
      }, 3 * 60 * 1000); // 3 minutes
      return () => clearTimeout(timer);
    }
  }, [isDemo]);

  if (timeLimitReached) {
    return (
      <div className="flex h-screen bg-[var(--ws-bg)] items-center justify-center flex-col gap-5 text-center p-6 z-[2000] relative">
        <div className="w-16 h-16 rounded-2xl bg-[#ffa116]/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,161,22,0.2)]">
          <ShieldAlert size={32} className="text-[#ffa116]" />
        </div>
        <div className="space-y-3">
          <h1 className="text-[var(--ws-text)] text-2xl font-bold">Time Limit Reached</h1>
          <p className="text-[var(--ws-text-muted)] text-sm max-w-sm leading-relaxed mx-auto">
            The dummy room cannot be used for more than 3 minutes. Login to Linko and code collaboratively for unlimited time.
          </p>
        </div>
        <div className="flex gap-4 mt-6">
          <button onClick={() => window.location.href = "/"} className="px-6 py-3 bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] hover:bg-[var(--ws-surface-hover)] text-[var(--ws-text)] font-semibold rounded-xl transition-colors">
            Return Home
          </button>
          <button onClick={() => window.location.href = "/login"} className="px-6 py-3 bg-[#ffa116] hover:bg-[#ffb342] text-black font-bold rounded-xl transition-colors shadow-lg shadow-[#ffa116]/20">
            Login to Linko
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-[var(--ws-bg)] overflow-hidden">
      {isDemo && identityStatus === "ready" && <RoomTour />}
      
      {/* Notification Toasts */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {notifications.map(n => (
          <div key={n.id} className="bg-[var(--ws-surface-elevated)]/90 backdrop-blur-md border border-[var(--ws-border)] text-[var(--ws-text)] px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium border-l-2 border-l-[var(--ws-accent)] animate-[slideIn_0.3s_ease-out]">
            {n.message}
          </div>
        ))}
      </div>

      <Group orientation="horizontal">
        
        {/* Left Panel: Problem Panel */}
        <Panel defaultSize={25} minSize={15} collapsible={true} className="bg-[var(--ws-surface)] overflow-hidden flex flex-col">
          {problemPanel}
        </Panel>

        <ResizeHandle direction="horizontal" />

        {/* Middle Panel: Editor & Test Cases */}
        <Panel defaultSize={55} minSize={30}>
          <Group orientation="vertical">
            <Panel defaultSize={70} minSize={20} collapsible={true} className="flex flex-col bg-[var(--ws-surface)]">
              <Editor />
            </Panel>
            
            <ResizeHandle direction="vertical" />
            
            <Panel defaultSize={30} minSize={10} collapsible={true} collapsedSize={5} className="bg-[var(--ws-surface)] flex flex-col">
              <BottomPanel />
            </Panel>
          </Group>
        </Panel>

        <ResizeHandle direction="horizontal" />

        {/* Right Panel: Collaborators, Activity & Controls */}
        <Panel defaultSize={20} minSize={10} collapsible={true} className="bg-[var(--ws-surface)] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            <Group orientation="vertical">
              <Panel defaultSize={40} minSize={20} className="flex flex-col">
                <div className="flex-1 overflow-y-auto ws-scrollbar">
                  <Members />
                </div>
              </Panel>
              <ResizeHandle direction="vertical" />
              <Panel defaultSize={60} minSize={30} className="flex flex-col border-t border-[var(--ws-border)]">
                <ChatPanel />
              </Panel>
            </Group>
          </div>
          <div className="shrink-0">
            <RoomControls />
          </div>
        </Panel>

      </Group>
    </div>
  );
}

export default function RoomLayout({ 
  roomId,
  problemPanel
}: { 
  roomId: string;
  problemPanel: React.ReactNode;
}) {
  return (
    <RoomProvider roomId={roomId}>
      <React.Suspense fallback={<div className="h-screen bg-[var(--ws-bg)]" />}>
        <RoomContent problemPanel={problemPanel} />
      </React.Suspense>
    </RoomProvider>
  );
}
