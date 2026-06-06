"use client";

import { useRoom } from "@/app/lib/RoomContext";
import { useState } from "react";
import ImportLeetCodeModal from "./ImportLeetCodeModal";
import CreateCustomProblemModal from "./CreateCustomProblemModal";

export default function ProblemPanel({ roomId }: { roomId: string }) {
  const { problemMetadata, hostId, currentUser } = useRoom();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  const isHost = hostId === currentUser?.id;

  if (!problemMetadata) {
    return (
      <div className="h-full overflow-y-auto bg-[var(--ws-surface)] flex flex-col items-center justify-center p-6 ws-scrollbar">
        <div className="text-center max-w-sm w-full bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[var(--ws-surface-hover)] flex items-center justify-center mx-auto mb-4 border border-[var(--ws-border)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[var(--ws-text)] mb-2">No Problem Loaded</h2>
          <p className="text-sm text-[var(--ws-text-muted)] leading-relaxed mb-6">
            Start collaborating by importing a problem from LeetCode or creating a custom problem.
          </p>
          
          {isHost ? (
            <div className="space-y-3">
              <button onClick={() => setShowImportModal(true)} className="w-full bg-[var(--ws-accent)] hover:bg-[#ffb342] text-black px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm">
                Import LeetCode Problem
              </button>
              <button onClick={() => setShowCustomModal(true)} className="w-full bg-[var(--ws-surface)] border border-[var(--ws-border)] text-[var(--ws-text-secondary)] hover:bg-[var(--ws-surface-hover)] hover:text-[var(--ws-text)] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
                Create Custom Problem
              </button>
            </div>
          ) : (
            <div className="text-sm text-[var(--ws-text-muted)] italic bg-[var(--ws-surface)] p-3 rounded-xl border border-[var(--ws-border)]">
              Waiting for host to select a problem...
            </div>
          )}
        </div>

        {showImportModal && <ImportLeetCodeModal onClose={() => setShowImportModal(false)} />}
        {showCustomModal && <CreateCustomProblemModal onClose={() => setShowCustomModal(false)} />}
      </div>
    );
  }

  const problem = problemMetadata;

  const difficultyBadge =
    problem.difficulty === "Easy"
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
      : problem.difficulty === "Medium"
        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
        : "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]";

  return (
    <div className="h-full overflow-y-auto bg-[var(--ws-surface)] p-0 ws-scrollbar">
      {/* Sticky Problem Header */}
      <div className="sticky top-0 z-10 bg-[var(--ws-surface)]/80 backdrop-blur-md border-b border-[var(--ws-border)] px-5 py-4">
        <div className="flex items-center gap-2.5 mb-2">
          <h2 className="text-lg font-semibold text-[var(--ws-text)]">
            {problem.title}
          </h2>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${difficultyBadge}`}>
            {problem.difficulty}
          </span>
        </div>
        {problem.topicTags && problem.topicTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {problem.topicTags.map((tag) => (
              <span key={tag} className="bg-[var(--ws-surface-hover)] text-[var(--ws-text-muted)] rounded-md px-2 py-0.5 text-[11px] font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="px-5 py-4">
        <div className="leetcode-content text-[var(--ws-text-secondary)]" dangerouslySetInnerHTML={{ __html: problem.content }} />

        {/* Hints */}
        {problem.hints && problem.hints.length > 0 && (
          <div className="mt-6 space-y-3">
            {problem.hints.map((hint, i) => (
              <details key={i} className="bg-[var(--ws-surface-elevated)] rounded-xl border border-[var(--ws-border)] overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-[var(--ws-text-secondary)] hover:text-[var(--ws-text)] transition-colors">
                  Hint {i + 1}
                </summary>
                <div className="px-4 pb-3 text-sm text-[var(--ws-text-secondary)]" dangerouslySetInnerHTML={{ __html: hint }} />
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}