"use client";

import { useRoom } from "@/app/lib/RoomContext";
import { Activity } from "lucide-react";

export default function ActivityFeed() {
  const { notifications } = useRoom();

  // Show latest notifications as activity feed (newest first, max 10)
  const feedItems = [...notifications].reverse().slice(0, 10);

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3 flex items-center gap-2">
        <Activity size={12} className="text-[var(--ws-text-muted)]" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ws-text-muted)]">
          Activity
        </span>
      </div>

      <div className="flex-1 overflow-y-auto ws-scrollbar px-4 pb-3 space-y-0.5">
        {feedItems.length === 0 ? (
          <p className="text-[11px] text-[var(--ws-text-muted)] italic py-2">
            No activity yet...
          </p>
        ) : (
          feedItems.map((item) => (
            <div
              key={item.id}
              className="text-[11px] text-[var(--ws-text-muted)] py-1.5 border-b border-[var(--ws-border)] last:border-b-0 animate-[fadeIn_0.3s_ease-out]"
            >
              {item.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
