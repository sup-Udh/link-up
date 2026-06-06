"use client";

import { useState } from "react";
import { useRoom } from "@/app/lib/RoomContext";
import { X, FileEdit, Plus, Trash2 } from "lucide-react";
import type { NormalizedProblem } from "@/app/lib/problem-engine/types";

export default function CreateCustomProblemModal({ onClose }: { onClose: () => void }) {
  const { setProblem } = useRoom();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [content, setContent] = useState("");
  const [examples, setExamples] = useState<{ input: string; output: string }[]>([{ input: "", output: "" }]);

  const handleAddExample = () => {
    setExamples([...examples, { input: "", output: "" }]);
  };

  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleExampleChange = (index: number, field: "input" | "output", value: string) => {
    const newExamples = [...examples];
    newExamples[index][field] = value;
    setExamples(newExamples);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) return;

    // Filter out empty examples
    const validExamples = examples.filter(ex => ex.input.trim() || ex.output.trim());

    const customProblem: NormalizedProblem = {
      title: title.trim(),
      slug: "custom-" + Date.now(),
      questionId: Date.now().toString(),
      difficulty,
      content: `<div class="custom-problem">${content.replace(/\n/g, "<br/>")}</div>`,
      hints: [],
      topicTags: ["Custom"],
      examples: validExamples.map((ex, i) => ({
        id: (i + 1).toString(),
        title: `Example ${i + 1}`,
        input: ex.input,
        output: ex.output
      })),
      starterCode: {},
      rawTestcases: validExamples.map(e => e.input).join("\n"),
      metadata: {
        functionName: "solve",
        parameters: ["input"],
        problemType: "FUNCTION"
      }
    };

    setProblem(customProblem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[var(--ws-border)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FileEdit size={16} />
            </div>
            <h2 className="text-lg font-bold text-[var(--ws-text)]">Create Custom Problem</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--ws-text-muted)] hover:text-[var(--ws-text)] hover:bg-[var(--ws-surface-hover)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 ws-scrollbar">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[var(--ws-text-secondary)] mb-2 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reverse a Linked List"
                className="w-full bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ws-text)] focus:outline-none focus:border-[var(--ws-accent)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ws-text-secondary)] mb-2 uppercase tracking-wider">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ws-text)] focus:outline-none focus:border-[var(--ws-accent)] transition-colors appearance-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ws-text-secondary)] mb-2 uppercase tracking-wider">
              Description
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the problem here... (Markdown-like formatting is supported if processed, otherwise plain text with line breaks)"
              className="w-full bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl px-4 py-3 text-sm text-[var(--ws-text)] focus:outline-none focus:border-[var(--ws-accent)] transition-colors h-32 resize-y"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-[var(--ws-text-secondary)] uppercase tracking-wider">
                Examples
              </label>
              <button
                type="button"
                onClick={handleAddExample}
                className="text-xs font-semibold text-[var(--ws-accent)] hover:text-[#ffb342] flex items-center gap-1"
              >
                <Plus size={14} /> Add Example
              </button>
            </div>
            
            <div className="space-y-3">
              {examples.map((ex, i) => (
                <div key={i} className="flex gap-3 items-start bg-[var(--ws-surface-hover)] p-3 rounded-xl border border-[var(--ws-border)]">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Input (e.g. nums = [2,7,11,15], target = 9)"
                      value={ex.input}
                      onChange={(e) => handleExampleChange(i, "input", e.target.value)}
                      className="w-full bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--ws-text)] focus:outline-none focus:border-[var(--ws-accent)]"
                    />
                    <input
                      type="text"
                      placeholder="Output (e.g. [0,1])"
                      value={ex.output}
                      onChange={(e) => handleExampleChange(i, "output", e.target.value)}
                      className="w-full bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--ws-text)] focus:outline-none focus:border-[var(--ws-accent)]"
                    />
                  </div>
                  {examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExample(i)}
                      className="p-2 text-[var(--ws-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>
        
        <div className="p-5 border-t border-[var(--ws-border)] flex justify-end gap-3 flex-shrink-0 bg-[var(--ws-surface)]">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-semibold bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-[var(--ws-text-secondary)] hover:text-[var(--ws-text)] hover:bg-[var(--ws-surface-hover)] transition-colors text-sm">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} disabled={!title.trim() || !content.trim()} className="px-5 py-2.5 rounded-xl font-bold bg-[var(--ws-accent)] text-black hover:bg-[#ffb342] transition-colors disabled:opacity-50 text-sm">
            Create Problem
          </button>
        </div>
      </div>
    </div>
  );
}
