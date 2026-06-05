import { getSlugForRoom } from "@/app/lib/db";
import { fetchLeetCodeProblem } from "@/app/lib/leetcode";
import { normalizeProblem } from "@/app/lib/problem-engine/normalizeProblem";

export default async function ProblemPanel({ roomId }: { roomId: string }) {
  const slug = await getSlugForRoom(roomId);
  
  if (!slug) {
    return (
      <div className="h-full overflow-y-auto bg-[var(--ws-surface)] flex items-center justify-center">
        <div className="text-center px-8 max-w-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--ws-surface-hover)] flex items-center justify-center mx-auto mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--ws-text-secondary)] mb-1.5">
            Waiting for problem...
          </p>
          <p className="text-xs text-[var(--ws-text-muted)] leading-relaxed">
            Launch a session from the Linko Chrome extension on a LeetCode problem page to sync the problem description here.
          </p>
        </div>
      </div>
    );
  }

  try {
    const raw = await fetchLeetCodeProblem(slug);
    const problem = normalizeProblem(raw);

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
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${difficultyBadge}`}
            >
              {problem.difficulty}
            </span>
          </div>
          {problem.topicTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {problem.topicTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[var(--ws-surface-hover)] text-[var(--ws-text-muted)] rounded-md px-2 py-0.5 text-[11px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="px-5 py-4">
          <div
            className="leetcode-content text-[var(--ws-text-secondary)]"
            dangerouslySetInnerHTML={{ __html: problem.content }}
          />

          {/* Hints */}
          {problem.hints.length > 0 && (
            <div className="mt-6 space-y-3">
              {problem.hints.map((hint, i) => (
                <details
                  key={i}
                  className="bg-[var(--ws-surface-elevated)] rounded-xl border border-[var(--ws-border)] overflow-hidden"
                >
                  <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-[var(--ws-text-secondary)] hover:text-[var(--ws-text)] transition-colors">
                    Hint {i + 1}
                  </summary>
                  <div
                    className="px-4 pb-3 text-sm text-[var(--ws-text-secondary)]"
                    dangerouslySetInnerHTML={{ __html: hint }}
                  />
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className="h-full overflow-y-auto bg-[var(--ws-surface)] flex items-center justify-center p-5">
        <div className="bg-[var(--ws-error)]/5 border border-[var(--ws-error)]/10 rounded-xl p-4 max-w-sm w-full">
          <h2 className="text-sm font-semibold text-red-400 mb-1">Error</h2>
          <p className="text-sm text-red-400/70">
            Failed to load problem data from LeetCode.
          </p>
        </div>
      </div>
    );
  }
}