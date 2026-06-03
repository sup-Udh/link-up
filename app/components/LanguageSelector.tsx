"use client";
import { useRoom } from "@/app/lib/RoomContext";
import { SUPPORTED_LANGUAGES } from "@/app/lib/languages";

export default function LanguageSelector() {
  const { language, changeLanguage } = useRoom();

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="bg-[#3d3d3d] text-gray-200 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500 cursor-pointer transition-colors hover:bg-[#4d4d4d]"
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
