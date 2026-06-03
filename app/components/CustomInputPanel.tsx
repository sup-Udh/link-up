"use client";
import { useRoom } from "@/app/lib/RoomContext";

export default function CustomInputPanel() {
  const { customInput, changeCustomInput } = useRoom();

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-gray-700 text-sm font-mono text-gray-300">
      <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
        <span className="font-semibold text-gray-200">Custom Input (JSON)</span>
      </div>
      <div className="flex-1 p-0">
        <textarea
          value={customInput}
          onChange={(e) => changeCustomInput(e.target.value)}
          placeholder='{\n  "a": 5,\n  "b": 3\n}'
          className="w-full h-full bg-[#1e1e1e] text-gray-300 p-4 resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
