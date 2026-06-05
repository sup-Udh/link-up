"use client";

import { useRoom } from "@/app/lib/RoomContext";
import { SUPPORTED_LANGUAGES } from "@/app/lib/languages";
import { ChevronDown } from "lucide-react";

export default function LanguageSelector() {
  const { language, changeLanguage } = useRoom();

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="appearance-none bg-[var(--ws-surface)] border border-[var(--ws-border)] hover:border-[var(--ws-border-hover)] rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-[var(--ws-text)] focus:outline-none focus:border-[var(--ws-accent)] focus:ring-1 focus:ring-[var(--ws-accent)]/20 cursor-pointer transition-colors"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ws-text-muted)] pointer-events-none"
      />
    </div>
  );
}
