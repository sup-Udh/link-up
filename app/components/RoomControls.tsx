"use client";

import { useRoom } from "@/app/lib/RoomContext";
import { Lock, Unlock, RotateCcw, LogOut } from "lucide-react";

export default function RoomControls() {
  const { currentUser, hostId, editorLocked, setEditorLock, resetSession, endSession } = useRoom();

  if (currentUser?.id !== hostId) {
    return null;
  }

  return (
    <div className="border-t border-[var(--ws-border)]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ws-text-muted)] px-4 pt-3 pb-2">
        Room Controls
      </div>
      <div className="px-4 pb-4 space-y-2">
        <button
          onClick={() => setEditorLock(!editorLocked)}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all border bg-[var(--ws-surface-elevated)] border-[var(--ws-border)] text-[var(--ws-text-secondary)] hover:bg-[var(--ws-surface-hover)] hover:text-[var(--ws-text)]"
        >
          {editorLocked ? (
            <>
              <Unlock className="w-3.5 h-3.5" />
              Unlock Editor
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              Lock Editor
            </>
          )}
        </button>
        <button
          onClick={resetSession}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all border bg-[var(--ws-surface-elevated)] border-[var(--ws-border)] text-[var(--ws-text-secondary)] hover:bg-[var(--ws-surface-hover)] hover:text-[var(--ws-text)]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Session
        </button>
        <button
          onClick={endSession}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all border bg-transparent border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
        >
          <LogOut className="w-3.5 h-3.5" />
          End Session
        </button>
      </div>
    </div>
  );
}
