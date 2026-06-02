"use client";
import { useRoom } from "@/app/lib/RoomContext";

export default function OutputPanel() {
  const { latestOutput, isExecuting } = useRoom();

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-sm font-mono text-gray-300">
      <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
        <span className="font-semibold text-gray-200">Execution Output</span>
        {isExecuting && (
          <span className="ml-3 text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full animate-pulse">
            Running...
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {!latestOutput ? (
          <div className="text-gray-500 italic">No output yet. Click "Run Code" to execute.</div>
        ) : (
          <pre className={`whitespace-pre-wrap ${latestOutput.success ? "text-green-400" : "text-red-400"}`}>
            {latestOutput.output}
          </pre>
        )}
      </div>
    </div>
  );
}
