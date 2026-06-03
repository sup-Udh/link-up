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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!latestOutput ? (
          <div className="text-gray-500 italic">No output yet. Click "Run Code" to execute.</div>
        ) : latestOutput.results && latestOutput.results.length > 0 ? (
          latestOutput.results.map((res, i) => (
            <div key={i} className="border border-gray-700 rounded bg-[#252525] p-3">
              <div className={`font-bold mb-2 flex items-center ${res.passed ? "text-green-500" : "text-red-500"}`}>
                <span className="mr-2">{res.passed ? "✓" : "✗"}</span>
                Example {i + 1} {res.passed ? "Passed" : "Failed"}
              </div>
              {res.error ? (
                <div className="text-red-400 mt-2 whitespace-pre-wrap">{res.error}</div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-xs mt-2">
                  <div className="bg-[#1a1a1a] p-2 rounded border border-gray-700">
                    <div className="text-gray-500 mb-1">Expected:</div>
                    <code className="text-green-400 break-all">{res.expected}</code>
                  </div>
                  <div className="bg-[#1a1a1a] p-2 rounded border border-gray-700">
                    <div className="text-gray-500 mb-1">Received:</div>
                    <code className={res.passed ? "text-green-400 break-all" : "text-red-400 break-all"}>
                      {res.received}
                    </code>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <pre className={`whitespace-pre-wrap ${latestOutput.success ? "text-green-400" : "text-red-400"}`}>
            {latestOutput.output}
          </pre>
        )}
      </div>
    </div>
  );
}
