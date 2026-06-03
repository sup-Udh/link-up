"use client";
import { useState, useEffect } from "react";
import { useRoom } from "@/app/lib/RoomContext";

export default function BottomPanel() {
  const { latestOutput, isExecuting, problemMetadata } = useRoom();
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");
  const [selectedCase, setSelectedCase] = useState(0);

  // Auto-switch to result tab when execution starts
  useEffect(() => {
    if (isExecuting) {
      setActiveTab("result");
    }
  }, [isExecuting]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-sm font-mono text-gray-300">
      {/* Tabs Header */}
      <div className="flex items-center bg-[#2d2d2d] border-b border-gray-700">
        <button
          onClick={() => setActiveTab("testcase")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "testcase" ? "text-white border-b-2 border-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Testcases
        </button>
        <button
          onClick={() => setActiveTab("result")}
          className={`px-4 py-2 font-semibold transition-colors flex items-center ${
            activeTab === "result" ? "text-white border-b-2 border-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Test Result
          {isExecuting && (
            <span className="ml-2 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "testcase" ? (
          /* Testcase View */
          !problemMetadata ? (
            <div className="text-gray-500 italic">Loading testcases...</div>
          ) : problemMetadata.testCases.length === 0 ? (
            <div className="text-gray-500 italic">No testcases available.</div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Case Selectors */}
              <div className="flex space-x-2 mb-4">
                {problemMetadata.testCases.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCase(i)}
                    className={`px-3 py-1 rounded transition-colors ${
                      selectedCase === i ? "bg-gray-600 text-white" : "bg-[#2d2d2d] text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    Case {i + 1}
                  </button>
                ))}
              </div>

              {/* Case Details */}
              <div className="space-y-4">
                {problemMetadata.parameters.map((param, pIdx) => {
                  const rawInputs = problemMetadata.testCases[selectedCase].split('\n').filter(l => l.trim() !== "");
                  return (
                    <div key={param.name}>
                      <div className="text-xs text-gray-500 mb-1">{param.name} =</div>
                      <div className="bg-[#2a2a2a] p-2 rounded border border-gray-700 text-gray-300 break-all">
                        {rawInputs[pIdx] || ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          /* Result View */
          !latestOutput ? (
            <div className="text-gray-500 italic">No output yet. Click "Run Code" to execute.</div>
          ) : latestOutput.results && latestOutput.results.length > 0 ? (
            latestOutput.results.map((res, i) => (
              <div key={i} className="border border-gray-700 rounded bg-[#252525] p-3 mb-4">
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
          )
        )}
      </div>
    </div>
  );
}
