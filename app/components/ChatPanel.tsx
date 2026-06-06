"use client";

import { useEffect, useRef, useState } from "react";
import { useRoom } from "@/app/lib/RoomContext";
import { Send, MessageSquare } from "lucide-react";

export default function ChatPanel() {
  const { messages, sendMessage, currentUser } = useRoom();
  const [inputText, setInputText] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--ws-surface)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--ws-border)] flex items-center gap-2">
        <MessageSquare size={14} className="text-[var(--ws-text-muted)]" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ws-text-muted)]">Room Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto ws-scrollbar p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--ws-text-muted)] opacity-50 space-y-2">
            <MessageSquare size={24} />
            <p className="text-xs">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && (
                  <span className="text-[10px] text-[var(--ws-text-muted)] font-medium ml-1 mb-1">
                    {msg.senderName}
                  </span>
                )}
                <div className={`px-3 py-2 rounded-2xl max-w-[90%] text-sm ${isMe ? "bg-[var(--ws-accent)] text-black rounded-tr-sm" : "bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-[var(--ws-text)] rounded-tl-sm"}`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-[var(--ws-text-muted)] mt-1 mx-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            );
          })
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--ws-border)] bg-[var(--ws-surface-elevated)]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-full px-4 py-2 text-sm text-[var(--ws-text)] focus:outline-none focus:border-[var(--ws-accent)] transition-colors placeholder:text-[var(--ws-text-muted)]"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-9 h-9 rounded-full bg-[var(--ws-accent)] text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--ws-accent-hover)] transition-colors shrink-0"
          >
            <Send size={16} className={inputText.trim() ? "ml-0.5" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
