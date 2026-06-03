"use client";

import dynamic from "next/dynamic";
import { RoomProvider, useRoom } from "@/app/lib/RoomContext";
import Members from "./Members";
import BottomPanel from "./BottomPanel";
import RoomControls from "./RoomControls";
import { useState } from "react";

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
  const { identityStatus, notifications } = useRoom();

  return (
    <div className="relative grid h-screen bg-gray-500 grid-cols-12 overflow-hidden">
      {identityStatus === "missing" && <IdentityModal />}
      
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {notifications.map(n => (
          <div key={n.id} className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg text-sm font-medium transition-opacity">
            {n.message}
          </div>
        ))}
      </div>

      <div className="col-span-3 border-r bg-[#282828] overflow-hidden">
        {problemPanel}
      </div>
      <div className="col-span-7 flex flex-col h-full bg-[#1e1e1e]">
        <div className="flex-1 overflow-hidden">
          <Editor />
        </div>
        <div className="h-64 shrink-0 border-t border-gray-700">
          <BottomPanel />
        </div>
      </div>
      <div className="col-span-2 border-l bg-[#2d2d2d] flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Members />
        </div>
        <div className="shrink-0">
          <RoomControls />
        </div>
      </div>
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
