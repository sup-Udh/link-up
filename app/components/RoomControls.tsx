"use client";

import { useRoom } from "@/app/lib/RoomContext";

export default function RoomControls() {
  const { currentUser, hostId, editorLocked, setEditorLock, resetSession, endSession } = useRoom();

  if (currentUser?.id !== hostId) {
    return null;
  }

  return (
    <div className="p-4 border-t border-gray-700 bg-[#252525]">
      <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>⚙️</span> Room Controls
      </h2>
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => setEditorLock(!editorLocked)} 
          className={`text-xs px-3 py-2 rounded font-medium transition flex items-center justify-center gap-2 ${editorLocked ? 'bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white' : 'bg-orange-600/20 text-orange-400 hover:bg-orange-600 hover:text-white'}`}
        >
          {editorLocked ? "🔓 Unlock Editor" : "🔒 Lock Editor"}
        </button>
        <button 
          onClick={resetSession} 
          className="text-xs bg-red-600/20 text-red-400 px-3 py-2 rounded font-medium hover:bg-red-600 hover:text-white transition"
        >
          Reset Session
        </button>
        <button 
          onClick={endSession} 
          className="text-xs bg-red-900/40 text-red-500 border border-red-900/50 px-3 py-2 rounded font-medium hover:bg-red-600 hover:text-white transition mt-2"
        >
          End Session
        </button>
      </div>
    </div>
  );
}
