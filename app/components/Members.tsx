"use client";

import { useRoom } from "@/app/lib/RoomContext";
import { useEffect, useState } from "react";
import Chat from "./Chat"

export default function Members() {
  const { users, awareness, currentUser, hostId, driverId, kickUser, transferHost, assignDriver, pendingRequests, approveUser, rejectUser } = useRoom();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    
    const handleAwarenessChange = () => {
      const activeTyping = new Set<string>();
      awareness.getStates().forEach((state: any) => {
        if (state.user && state.typing) {
          activeTyping.add(state.user.id);
        }
      });
      setTypingUsers(activeTyping);
    };

    awareness.on("change", handleAwarenessChange);
    return () => awareness.off("change", handleAwarenessChange);
  }, [awareness]);

  const isHost = currentUser?.id === hostId;


  return (
    <div className="flex flex-col h-full text-white">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Members</h2>
        <div className="text-xs text-green-400 mt-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {users.length} Online
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {users.map(u => (
          <div key={u.id} className="flex flex-col group">
            <div className="flex items-center gap-2">
              <span className="text-sm">{u.id === hostId ? "👑" : "🟢"}</span>
              <span className="text-sm font-medium flex-1 truncate">
                {u.name} {u.id === currentUser?.id && <span className="text-gray-400 font-normal">(You)</span>}
                
              </span>
              {u.id === driverId && <span title="Driver" className="text-sm">🎮</span>}
            </div>
            
            {typingUsers.has(u.id) && (
              <span className="text-xs text-gray-400 italic ml-6 animate-pulse">is typing...</span>
            )}
            
            {isHost && u.id !== hostId && (
              <div className="ml-6 mt-1 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => kickUser(u.id)} className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded hover:bg-red-600 hover:text-white transition">Kick</button>
                <button onClick={() => transferHost(u.id)} className="text-[10px] bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded hover:bg-yellow-600 hover:text-white transition">Make Host</button>
                {driverId === u.id ? (
                  <button onClick={() => assignDriver(null)} className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded hover:bg-blue-600 hover:text-white transition">Revoke Control</button>
                ) : (
                  <button onClick={() => assignDriver(u.id)} className="text-[10px] bg-green-600/20 text-green-400 px-2 py-0.5 rounded hover:bg-green-600 hover:text-white transition">Give Control</button>
                )}
              </div>
            )}

            {isHost && u.id === hostId && driverId && driverId !== hostId && (
              <div className="ml-6 mt-1 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => assignDriver(hostId)} className="text-[10px] bg-green-600/20 text-green-400 px-2 py-0.5 rounded hover:bg-green-600 hover:text-white transition">Take Control</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {currentUser && <Chat senderId={currentUser.name}/>} 

      {isHost && pendingRequests.length > 0 && (
        <div className="p-4 border-t border-gray-700 bg-[#252525] shrink-0">
          <h2 className="font-semibold text-xs text-yellow-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-48">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex flex-col bg-[#1e1e1e] p-2 rounded border border-gray-700 shadow-sm">
                <span className="text-sm font-medium mb-2 text-gray-200">🙋 {req.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => approveUser(req.id)} className="flex-1 text-xs bg-green-600/20 text-green-400 py-1.5 rounded font-medium hover:bg-green-600 hover:text-white transition">Accept</button>
                  <button onClick={() => rejectUser(req.id)} className="flex-1 text-xs bg-red-600/20 text-red-400 py-1.5 rounded font-medium hover:bg-red-600 hover:text-white transition">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}