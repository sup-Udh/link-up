"use client";

import dynamic from "next/dynamic";
import { RoomProvider, useRoom } from "@/app/lib/RoomContext";
import Members from "./Members";
import BottomPanel from "./BottomPanel";
import RoomControls from "./RoomControls";
import { useState } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";

function ResizeHandle({ direction = "horizontal" }: { direction?: "horizontal" | "vertical" }) {
  return (
    <Separator className={`relative flex items-center justify-center bg-gray-800 transition-colors hover:bg-green-500/50 active:bg-green-500
      ${direction === "horizontal" ? "w-1 cursor-col-resize z-10" : "h-1 cursor-row-resize z-10"}
    `}>
      <div className={`bg-gray-600 rounded-full transition-all ${direction === "horizontal" ? "w-[2px] h-8" : "h-[2px] w-8"}`} />
    </Separator>
  );
}

const Editor = dynamic(() => import("./Editors"), { ssr: false });

function IdentityModal() {
  const { setIdentity } = useRoom();
  const [name, setName] = useState("");
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] p-6 rounded-lg w-80 shadow-2xl border border-gray-700">
        <h2 className="text-white text-lg font-bold mb-4">Enter Display Name</h2>
        <input 
          type="text" 
          value={name} 
          onChange={e=>setName(e.target.value)} 
          className="w-full bg-[#1e1e1e] border border-gray-600 text-white p-2 rounded mb-4 focus:border-green-500 focus:outline-none" 
          placeholder="Your name..." 
        />
        <button 
          onClick={() => name.trim().length >= 2 && setIdentity(name)} 
          className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 transition"
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
      <div className="flex h-screen bg-[#1e1e1e] items-center justify-center flex-col gap-4 text-center p-6">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <h1 className="text-white text-2xl font-bold">Waiting For Host Approval</h1>
        <p className="text-gray-400">Host must approve your request before joining.</p>
        <p className="text-sm text-gray-500 italic mt-2">Your request has been sent.</p>
        <button onClick={() => window.location.href = "/"} className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition">Cancel Request</button>
      </div>
    );
  }

  if (joinStatus === "rejected") {
    return (
      <div className="flex h-screen bg-[#1e1e1e] items-center justify-center flex-col gap-4 text-center p-6">
        <div className="text-6xl mb-2">❌</div>
        <h1 className="text-red-500 text-2xl font-bold">Request Declined</h1>
        <p className="text-gray-400">Your join request was declined by the host.</p>
        <div className="flex gap-4 mt-4">
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition">Retry</button>
          <button onClick={() => window.location.href = "/"} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition">Leave</button>
        </div>
      </div>
    );
  }

  if (joinStatus === "connecting") {
    return (
      <div className="flex h-screen bg-[#1e1e1e] items-center justify-center flex-col gap-4">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400">Connecting to room...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-[#1e1e1e] overflow-hidden">
      
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {notifications.map(n => (
          <div key={n.id} className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg text-sm font-medium transition-opacity">
            {n.message}
          </div>
        ))}
      </div>

      <Group orientation="horizontal">
        
        {/* Left Panel: Problem Panel */}
        <Panel defaultSize={25} minSize={15} collapsible={true} className="bg-[#282828] overflow-hidden flex flex-col">
          {problemPanel}
        </Panel>

        <ResizeHandle direction="horizontal" />

        {/* Middle Panel: Editor & Test Cases */}
        <Panel defaultSize={55} minSize={30}>
          <Group orientation="vertical">
            <Panel defaultSize={70} minSize={20} collapsible={true} className="flex flex-col bg-[#1e1e1e]">
              <Editor />
            </Panel>
            
            <ResizeHandle direction="vertical" />
            
            <Panel defaultSize={30} minSize={10} collapsible={true} collapsedSize={5} className="bg-[#1e1e1e] flex flex-col">
              <BottomPanel />
            </Panel>
          </Group>
        </Panel>

        <ResizeHandle direction="horizontal" />

        {/* Right Panel: Members & Controls */}
        <Panel defaultSize={20} minSize={10} collapsible={true} className="bg-[#2d2d2d] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Members />
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
      <RoomContent problemPanel={problemPanel} />
    </RoomProvider>
  );
}
