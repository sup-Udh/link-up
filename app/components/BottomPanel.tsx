"use client";
import { useState, useEffect } from "react";
import { useRoom } from "@/app/lib/RoomContext";

export default function BottomPanel() {
  const { 
    latestOutput, 
    testResults,
    isExecutingIndex, 
    runCode, 
    problemMetadata,
    customCases,
    addCustomCase,
    updateCustomCase,
    deleteCustomCase
  } = useRoom();
  
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");

  // Auto-switch to result tab when execution starts
  useEffect(() => {
    if (isExecutingIndex !== null) {
      setActiveTab("result");
    }
  }, [isExecutingIndex]);

  const handleAddCustomCase = () => {
    addCustomCase({
      id: crypto.randomUUID(),
      input: "",
      expectedOutput: ""
    });
  };

  const totalCases = (problemMetadata?.testCases.length || 0) + customCases.length;
  const ranCases = Object.keys(testResults).length;
  const passedCases = Object.values(testResults).filter(r => r.passed).length;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-sm font-mono text-gray-300">
      {/* Tabs Header */}
      <div className="flex items-center justify-between bg-[#2d2d2d] border-b border-gray-700 pr-4">
        <div className="flex items-center">
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
            {isExecutingIndex !== null && (
              <span className="ml-2 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            )}
          </button>
        </div>
        <button 
          onClick={() => runCode("all")} 
          disabled={isExecutingIndex !== null}
          className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-sm transition"
        >
          {isExecutingIndex === "all" ? "Running All..." : "▶ Run All Cases"}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === "testcase" ? (
          /* Testcase View */
          !problemMetadata ? (
            <div className="text-gray-500 italic">Loading testcases...</div>
          ) : (
            <div className="space-y-8 pb-8">
              {/* LeetCode Examples */}
              <div>
                <h3 className="text-gray-400 font-bold mb-4 uppercase tracking-wider text-xs">LeetCode Examples</h3>
                {problemMetadata.testCases.length === 0 ? (
                  <div className="text-gray-500 italic">No examples available.</div>
                ) : (
                  <div className="space-y-4">
                    {problemMetadata.testCases.map((tc, idx) => {
                      const rawInputs = tc.split('\n').filter(l => l.trim() !== "");
                      return (
                        <div key={`lc-${idx}`} className="bg-[#252525] border border-gray-700 rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                            <span className="font-bold text-gray-200">Example {idx + 1}</span>
                            <button 
                              onClick={() => runCode(idx)} 
                              disabled={isExecutingIndex !== null}
                              className="px-3 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white disabled:opacity-50 rounded text-xs font-medium transition flex items-center"
                            >
                              {isExecutingIndex === idx ? <span className="animate-spin mr-1">⌛</span> : "▶ "} Run Example
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {problemMetadata.parameters.map((param, pIdx) => (
                              <div key={param.name}>
                                <div className="text-xs text-gray-500 mb-1">{param.name} =</div>
                                <div className="bg-[#1a1a1a] px-3 py-2 rounded border border-gray-700 text-gray-300 break-all">
                                  {rawInputs[pIdx] || ""}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Custom Cases */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs">Custom Cases</h3>
                  <button onClick={handleAddCustomCase} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition shadow-sm">+ Add Case</button>
                </div>
                
                {customCases.length === 0 ? (
                  <div className="text-gray-500 italic text-sm">No custom cases added yet.</div>
                ) : (
                  <div className="space-y-4">
                    {customCases.map((tc, cIdx) => {
                      const absoluteIdx = problemMetadata.testCases.length + cIdx;
                      return (
                        <div key={tc.id} className="bg-[#252525] border border-yellow-700/50 rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                            <span className="font-bold text-yellow-500/80">Custom Case {cIdx + 1}</span>
                            <div className="flex gap-2">
                              <button onClick={() => deleteCustomCase(tc.id)} className="px-2 py-1 bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white rounded text-xs transition">Delete</button>
                              <button 
                                onClick={() => runCode(absoluteIdx)} 
                                disabled={isExecutingIndex !== null}
                                className="px-3 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white disabled:opacity-50 rounded text-xs font-medium transition flex items-center"
                              >
                                {isExecutingIndex === absoluteIdx ? <span className="animate-spin mr-1">⌛</span> : "▶ "} Run Case
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Input (newline separated arguments)</label>
                              <textarea 
                                className="w-full bg-[#1a1a1a] border border-gray-600 focus:border-blue-500 outline-none rounded p-3 text-gray-300 text-sm font-mono h-24 resize-y transition-colors"
                                value={tc.input}
                                placeholder="e.g.&#10;[1, 2, 3]&#10;4"
                                onChange={(e) => updateCustomCase({ ...tc, input: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Expected Output</label>
                              <textarea 
                                className="w-full bg-[#1a1a1a] border border-gray-600 focus:border-blue-500 outline-none rounded p-3 text-gray-300 text-sm font-mono h-16 resize-y transition-colors"
                                value={tc.expectedOutput}
                                placeholder="e.g. 5"
                                onChange={(e) => updateCustomCase({ ...tc, expectedOutput: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          /* Result View */
          <div className="pb-8">
            {/* Summary Header */}
            {ranCases > 0 && (
              <div className={`mb-6 p-4 rounded-lg border flex items-center justify-between shadow-sm ${passedCases === totalCases && ranCases === totalCases ? 'bg-green-900/20 border-green-700/50 text-green-400' : 'bg-yellow-900/20 border-yellow-700/50 text-yellow-500'}`}>
                <div className="text-lg font-bold">
                  Passed {passedCases} / {ranCases} executed
                  {ranCases < totalCases && <span className="text-sm opacity-70 ml-2">({totalCases} total cases)</span>}
                </div>
                {passedCases === totalCases && ranCases === totalCases && (
                  <div className="font-black tracking-widest uppercase text-sm">Accepted</div>
                )}
              </div>
            )}

            {!latestOutput && ranCases === 0 ? (
              <div className="text-gray-500 italic mt-8 text-center">No output yet. Click "Run All Cases" to execute.</div>
            ) : (
              <div className="space-y-4">
                {/* Individual Case Results */}
                {totalCases > 0 && Array.from({ length: totalCases }).map((_, idx) => {
                  const res = testResults[idx];
                  if (!res) return null;
                  
                  const isCustom = idx >= (problemMetadata?.testCases.length || 0);
                  const title = isCustom ? `Custom Case ${idx - (problemMetadata?.testCases.length || 0) + 1}` : `Example ${idx + 1}`;
                  
                  return (
                    <div key={`res-${idx}`} className={`border rounded-lg bg-[#252525] p-4 shadow-sm ${res.passed ? "border-green-900/30" : "border-red-900/50"}`}>
                      <div className={`font-bold mb-3 flex items-center justify-between ${res.passed ? "text-green-500" : "text-red-500"}`}>
                        <div className="flex items-center text-base">
                          <span className="mr-2 text-xl">{res.passed ? "✓" : "✗"}</span>
                          {title} <span className="opacity-70 ml-2 text-sm">{res.passed ? "Passed" : "Failed"}</span>
                        </div>
                        <button 
                          onClick={() => runCode(idx)} 
                          disabled={isExecutingIndex !== null}
                          className="px-3 py-1 bg-[#1e1e1e] hover:bg-gray-700 text-gray-300 disabled:opacity-50 rounded text-xs border border-gray-600 transition flex items-center"
                        >
                          {isExecutingIndex === idx ? <span className="animate-spin">⌛</span> : "▶ Re-run"}
                        </button>
                      </div>

                      {res.error ? (
                        <div className="text-red-400 mt-3 whitespace-pre-wrap font-mono text-xs p-3 bg-[#1a1a1a] rounded border border-red-900/50">
                          {res.error}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 text-xs mt-3">
                          <div className="bg-[#1a1a1a] p-3 rounded border border-gray-700">
                            <div className="text-gray-500 mb-2 font-semibold tracking-wide uppercase">Expected Output</div>
                            <pre className="text-gray-300 break-all whitespace-pre-wrap font-mono">{res.expected}</pre>
                          </div>
                          <div className="bg-[#1a1a1a] p-3 rounded border border-gray-700">
                            <div className="text-gray-500 mb-2 font-semibold tracking-wide uppercase">Received Output</div>
                            <pre className={res.passed ? "text-green-400 break-all whitespace-pre-wrap font-mono" : "text-red-400 break-all whitespace-pre-wrap font-mono"}>
                              {res.received || "undefined"}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Global Compile/Runtime Errors */}
                {latestOutput?.output && (!latestOutput.success || ranCases === 0) && (
                  <div className="mt-6 border border-red-900/50 bg-[#252525] rounded-lg p-4 shadow-sm">
                    <div className="text-xs text-red-500 mb-3 font-bold uppercase tracking-wide flex items-center">
                      <span className="mr-2">⚠️</span> Console Output / Compilation Error
                    </div>
                    <pre className="text-red-400 whitespace-pre-wrap text-xs bg-[#1a1a1a] p-4 rounded border border-red-900/30 overflow-x-auto">
                      {latestOutput.output}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
