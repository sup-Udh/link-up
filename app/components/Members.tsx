"use client";

import { useRoom } from "@/app/lib/RoomContext";
import { useEffect, useState } from "react";

export default function Members() {
  const { users, awareness } = useRoom();
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
          <div key={u.id} className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm">🟢</span>
              <span className="text-sm font-medium">{u.name}</span>
            </div>
            {typingUsers.has(u.id) && (
              <span className="text-xs text-gray-400 italic ml-6 animate-pulse">is typing...</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}