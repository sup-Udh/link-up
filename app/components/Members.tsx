"use client";

import { useRoom } from "@/app/lib/RoomContext";
import { useEffect, useState } from "react";
import { UserX, Crown, Gamepad2, Check, X } from "lucide-react";

// Generate a consistent HSL color from a user ID string
function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 50%)`;
}

function getInitial(name: string): string {
  return (name || "?").charAt(0).toUpperCase();
}

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--ws-border)] flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ws-text-muted)]">
          Collaborators
        </span>
        <span className="bg-[var(--ws-surface-hover)] text-[var(--ws-text-muted)] rounded-full px-2 py-0.5 text-[10px] font-medium inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--ws-success)] shrink-0" />
          {users.length}
        </span>
      </div>

      {/* Pending Requests (host only) */}
      {isHost && pendingRequests.length > 0 && (
        <div className="mx-4 mt-3 mb-1 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 space-y-2">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
            Pending Requests
          </span>
          <div className="space-y-2 overflow-y-auto max-h-40 ws-scrollbar">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-[var(--ws-text)] truncate flex-1">
                  {req.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => approveUser(req.id)}
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    title="Accept"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => rejectUser(req.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Reject"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 ws-scrollbar">
        {users.map(u => {
          const avatarColor = getAvatarColor(u.id);
          const isCurrentUser = u.id === currentUser?.id;
          const isUserHost = u.id === hostId;
          const isDriver = u.id === driverId;
          const isTyping = typingUsers.has(u.id);

          return (
            <div
              key={u.id}
              className="bg-[var(--ws-surface-elevated)] rounded-xl p-3 group hover:bg-[var(--ws-surface-hover)] transition-colors"
            >
              {/* Top row: avatar + name + badges */}
              <div className="flex items-center gap-2.5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold select-none"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {getInitial(u.name)}
                  </div>
                  {isUserHost && (
                    <span className="absolute -top-1 -right-1 text-[10px] leading-none">👑</span>
                  )}
                </div>

                {/* Name + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-[var(--ws-text)] truncate">
                      {u.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[var(--ws-text-muted)] text-xs ml-1">(You)</span>
                    )}
                    {isUserHost && (
                      <span className="text-[var(--ws-accent)] text-[10px] font-semibold">Host</span>
                    )}
                    {isDriver && (
                      <span className="text-blue-400 text-[10px] font-semibold">Driver</span>
                    )}
                  </div>

                  {/* Typing indicator */}
                  {isTyping && (
                    <span className="text-[11px] text-[var(--ws-text-muted)] italic">
                      is typing
                      <span className="inline-flex w-4">
                        <span className="animate-pulse">...</span>
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Host controls for other users (hover reveal) */}
              {isHost && !isUserHost && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                  <button
                    onClick={() => kickUser(u.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--ws-surface)] text-[var(--ws-text-muted)] hover:text-[var(--ws-text)] transition-colors"
                    title="Kick user"
                  >
                    <UserX size={14} />
                  </button>
                  <button
                    onClick={() => transferHost(u.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--ws-surface)] text-[var(--ws-text-muted)] hover:text-[var(--ws-text)] transition-colors"
                    title="Transfer host"
                  >
                    <Crown size={14} />
                  </button>
                  {driverId === u.id ? (
                    <button
                      onClick={() => assignDriver(null)}
                      className="p-1.5 rounded-lg hover:bg-[var(--ws-surface)] text-blue-400 hover:text-blue-300 transition-colors"
                      title="Revoke control"
                    >
                      <Gamepad2 size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => assignDriver(u.id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--ws-surface)] text-[var(--ws-text-muted)] hover:text-[var(--ws-text)] transition-colors"
                      title="Give control"
                    >
                      <Gamepad2 size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Host's own "Take Control" button when another user is driving */}
              {isHost && isUserHost && driverId && driverId !== hostId && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                  <button
                    onClick={() => assignDriver(hostId)}
                    className="p-1.5 rounded-lg hover:bg-[var(--ws-surface)] text-[var(--ws-text-muted)] hover:text-[var(--ws-text)] transition-colors"
                    title="Take control"
                  >
                    <Gamepad2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}