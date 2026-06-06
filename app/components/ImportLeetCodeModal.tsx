"use client";

import { useState } from "react";
import { useRoom } from "@/app/lib/RoomContext";
import { X, Search, Code2 } from "lucide-react";

export default function ImportLeetCodeModal({ onClose }: { onClose: () => void }) {
  const { setProblem } = useRoom();
  const [urlOrSlug, setUrlOrSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlOrSlug.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Extract slug from URL if needed
      let slug = urlOrSlug.trim();
      if (slug.includes("leetcode.com/problems/")) {
        const parts = slug.split("leetcode.com/problems/");
        slug = parts[1].split("/")[0];
      }

      // Fetch from API
      const res = await fetch(`/api/problem?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) {
        throw new Error("Failed to fetch problem. Check the URL or slug.");
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setProblem(data);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[var(--ws-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ffa116]/10 text-[#ffa116] flex items-center justify-center">
              <Code2 size={16} />
            </div>
            <h2 className="text-lg font-bold text-[var(--ws-text)]">Import LeetCode</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--ws-text-muted)] hover:text-[var(--ws-text)] hover:bg-[var(--ws-surface-hover)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleImport} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-semibold text-[var(--ws-text-secondary)] mb-2 uppercase tracking-wider">
              Problem URL or Slug
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--ws-text-muted)]">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={urlOrSlug}
                onChange={(e) => setUrlOrSlug(e.target.value)}
                placeholder="e.g. https://leetcode.com/problems/two-sum/"
                className="w-full bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--ws-text)] focus:outline-none focus:border-[var(--ws-accent)] transition-colors"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-[var(--ws-text-muted)] mt-2">
              Paste the full URL or just the problem slug (e.g. <code>two-sum</code>).
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl font-semibold bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-[var(--ws-text-secondary)] hover:text-[var(--ws-text)] hover:bg-[var(--ws-surface-hover)] transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading || !urlOrSlug.trim()} className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-[var(--ws-accent)] text-black hover:bg-[#ffb342] transition-colors disabled:opacity-50 flex justify-center items-center text-sm">
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                "Import Problem"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
