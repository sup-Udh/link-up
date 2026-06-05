"use client";
import { useState, useEffect } from "react";
import { useRoom } from "@/app/lib/RoomContext";
import { Play, Plus, Trash2, RotateCcw, AlertTriangle, Check, X, Loader2 } from "lucide-react";

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

  const exampleCount = problemMetadata?.examples?.length || 0;
  const totalCases = exampleCount + (customCases?.length || 0);
  const ranCases = Object.keys(testResults).length;
  const passedCases = Object.values(testResults).filter(r => r.passed).length;

  return (
    <div className="flex flex-col h-full bg-[var(--ws-surface)] text-sm font-sans text-[var(--ws-text)]">
      {/* Tab Bar */}
      <div className="flex items-center justify-between bg-[var(--ws-surface-elevated)] border-b border-[var(--ws-border)] px-3 py-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("testcase")}
            className={`px-3 py-2.5 text-xs font-medium transition-colors ${
              activeTab === "testcase"
                ? "text-[var(--ws-text)] border-b-2 border-[var(--ws-accent)]"
                : "text-[var(--ws-text-muted)] hover:text-[var(--ws-text-secondary)]"
            }`}
          >
            Testcases
          </button>
          <button
            onClick={() => setActiveTab("result")}
            className={`px-3 py-2.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "result"
                ? "text-[var(--ws-text)] border-b-2 border-[var(--ws-accent)]"
                : "text-[var(--ws-text-muted)] hover:text-[var(--ws-text-secondary)]"
            }`}
          >
            Test Result
            {isExecutingIndex !== null && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ws-accent)] animate-pulse" />
            )}
          </button>
        </div>
        <button 
          onClick={() => runCode("all")} 
          disabled={isExecutingIndex !== null}
          className="border border-[var(--ws-accent)]/30 text-[var(--ws-accent)] hover:bg-[var(--ws-accent)]/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          {isExecutingIndex === "all" ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Running…
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              Run All
            </>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 ws-scrollbar">
        {activeTab === "testcase" ? (
          /* Testcase View */
          !problemMetadata ? (
            <div className="text-[var(--ws-text-muted)] text-xs">Loading testcases…</div>
          ) : (
            <div className="space-y-6 pb-4">
              {/* LeetCode Examples */}
              <div>
                <h3 className="text-[10px] uppercase tracking-wider text-[var(--ws-text-muted)] font-semibold mb-3">Examples</h3>
                {exampleCount === 0 ? (
                  <div className="text-[var(--ws-text-muted)] text-xs">No examples available.</div>
                ) : (
                  <div className="space-y-3">
                    {problemMetadata.examples.map((ex, idx) => {
                      const result = testResults[idx];
                      const borderClass = result
                        ? result.passed
                          ? "border-l-2 border-l-[var(--ws-success)]"
                          : "border-l-2 border-l-[var(--ws-error)]"
                        : "";

                      return (
                        <div
                          key={`lc-${ex.id}`}
                          className={`bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl p-4 space-y-3 ${borderClass}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-[var(--ws-text)]">{ex.title}</span>
                            <button 
                              onClick={() => runCode(idx)} 
                              disabled={isExecutingIndex !== null}
                              className="p-1.5 rounded-lg text-[var(--ws-text-muted)] hover:text-[var(--ws-accent)] hover:bg-[var(--ws-surface-hover)] disabled:opacity-40 transition-colors"
                            >
                              {isExecutingIndex === idx ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-[var(--ws-text-muted)] font-semibold mb-1">Input</div>
                              <div className="bg-[var(--ws-surface)] rounded-lg px-3 py-2 font-mono text-xs text-[var(--ws-text-secondary)] break-all whitespace-pre-wrap">
                                {ex.input}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-[var(--ws-text-muted)] font-semibold mb-1">Expected Output</div>
                              <div className="bg-[var(--ws-surface)] rounded-lg px-3 py-2 font-mono text-xs text-[var(--ws-text-secondary)] break-all whitespace-pre-wrap">
                                {ex.output}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Custom Cases */}
              <div>
                <h3 className="text-[10px] uppercase tracking-wider text-[var(--ws-text-muted)] font-semibold mb-3">Custom Cases</h3>
                
                <div className="space-y-3">
                  {customCases.map((tc, cIdx) => {
                    const absoluteIdx = exampleCount + cIdx;
                    const result = testResults[absoluteIdx];
                    const borderClass = result
                      ? result.passed
                        ? "border-l-2 border-l-[var(--ws-success)]"
                        : "border-l-2 border-l-[var(--ws-error)]"
                      : "";

                    return (
                      <div
                        key={tc.id}
                        className={`bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl p-4 space-y-3 ${borderClass}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-[var(--ws-text)]">Custom Case {cIdx + 1}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deleteCustomCase(tc.id)}
                              className="p-1.5 rounded-lg text-[var(--ws-text-muted)] hover:text-[var(--ws-error)] hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => runCode(absoluteIdx)} 
                              disabled={isExecutingIndex !== null}
                              className="p-1.5 rounded-lg text-[var(--ws-text-muted)] hover:text-[var(--ws-accent)] hover:bg-[var(--ws-surface-hover)] disabled:opacity-40 transition-colors"
                            >
                              {isExecutingIndex === absoluteIdx ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-[var(--ws-text-muted)] font-semibold mb-1">Input</div>
                            <textarea 
                              className="w-full bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-lg px-3 py-2 font-mono text-xs text-[var(--ws-text-secondary)] resize-none focus:outline-none focus:border-[var(--ws-accent)] h-20 transition-colors"
                              value={tc.input}
                              placeholder={"e.g.\n[1, 2, 3]\n4"}
                              onChange={(e) => updateCustomCase({ ...tc, input: e.target.value })}
                            />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-[var(--ws-text-muted)] font-semibold mb-1">Expected Output</div>
                            <textarea 
                              className="w-full bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-lg px-3 py-2 font-mono text-xs text-[var(--ws-text-secondary)] resize-none focus:outline-none focus:border-[var(--ws-accent)] h-14 transition-colors"
                              value={tc.expectedOutput}
                              placeholder="e.g. 5"
                              onChange={(e) => updateCustomCase({ ...tc, expectedOutput: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Case Button */}
                  <button
                    onClick={handleAddCustomCase}
                    className="w-full border border-dashed border-[var(--ws-border-hover)] rounded-xl p-4 text-center hover:border-[var(--ws-accent)] text-[var(--ws-text-muted)] hover:text-[var(--ws-accent)] transition-colors text-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Case
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          /* Result View */
          <div className="pb-4">
            {/* Summary Header */}
            {ranCases > 0 && (
              <div className="bg-[var(--ws-surface-elevated)] rounded-xl p-4 border border-[var(--ws-border)] mb-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[var(--ws-text)]">
                    Passed {passedCases} / {ranCases} executed
                    {ranCases < totalCases && (
                      <span className="text-xs text-[var(--ws-text-muted)] ml-2">({totalCases} total)</span>
                    )}
                  </div>
                  {passedCases === totalCases && ranCases === totalCases && (
                    <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 text-xs font-semibold">
                      Accepted
                    </div>
                  )}
                </div>
              </div>
            )}

            {!latestOutput && ranCases === 0 ? (
              <div className="text-[var(--ws-text-muted)] text-xs text-center py-12">
                No output yet. Click &quot;Run All&quot; to execute.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Individual Case Results */}
                {totalCases > 0 && Array.from({ length: totalCases }).map((_, idx) => {
                  const res = testResults[idx];
                  if (!res) return null;
                  
                  const isCustom = idx >= exampleCount;
                  const title = isCustom 
                    ? `Custom Case ${idx - exampleCount + 1}` 
                    : (problemMetadata?.examples?.[idx]?.title || `Example ${idx + 1}`);
                  
                  return (
                    <div
                      key={`res-${idx}`}
                      className={`bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl p-4 ${
                        res.passed
                          ? "border-l-2 border-l-[var(--ws-success)]"
                          : "border-l-2 border-l-[var(--ws-error)]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {res.passed ? (
                            <Check className="w-3.5 h-3.5 text-[var(--ws-success)]" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-[var(--ws-error)]" />
                          )}
                          <span className="text-xs font-semibold text-[var(--ws-text)]">{title}</span>
                          <span className={`text-[10px] font-medium ${res.passed ? "text-[var(--ws-success)]" : "text-[var(--ws-error)]"}`}>
                            {res.passed ? "Passed" : "Failed"}
                          </span>
                        </div>
                        <button 
                          onClick={() => runCode(idx)} 
                          disabled={isExecutingIndex !== null}
                          className="p-1.5 rounded-lg text-[var(--ws-text-muted)] hover:text-[var(--ws-accent)] hover:bg-[var(--ws-surface-hover)] disabled:opacity-40 transition-colors"
                        >
                          {isExecutingIndex === idx ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {res.error ? (
                        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-red-400 font-mono text-xs whitespace-pre-wrap">
                          {res.error}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-[var(--ws-text-muted)] font-semibold mb-1">Expected</div>
                            <div className="bg-[var(--ws-surface)] rounded-lg px-3 py-2">
                              <pre className="text-[var(--ws-text-secondary)] break-all whitespace-pre-wrap font-mono text-xs">{res.expected}</pre>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-[var(--ws-text-muted)] font-semibold mb-1">Received</div>
                            <div className="bg-[var(--ws-surface)] rounded-lg px-3 py-2">
                              <pre className={`break-all whitespace-pre-wrap font-mono text-xs ${res.passed ? "text-[var(--ws-success)]" : "text-[var(--ws-error)]"}`}>
                                {res.received || "undefined"}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Global Compile/Runtime Errors */}
                {latestOutput?.output && (!latestOutput.success || ranCases === 0) && (
                  <div className="bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-[var(--ws-error)] text-xs font-semibold mb-3">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Console Output / Compilation Error
                    </div>
                    <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                      <pre className="text-red-400 whitespace-pre-wrap font-mono text-xs overflow-x-auto">
                        {latestOutput.output}
                      </pre>
                    </div>
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
