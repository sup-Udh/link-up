"use client";

import { useEffect, useState, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRoom } from "@/app/lib/RoomContext";
import type { editor as monacoEditor } from "monaco-editor";

export default function Editor() {
  const { yText, awareness, runCode, isExecuting } = useRoom();
  const [editor, setEditor] =
    useState<monacoEditor.IStandaloneCodeEditor | null>(null);

  // Cursor tracking + rendering (runs after editor mounts)
  useEffect(() => {
    if (!editor) return;

    const decorations = editor.createDecorationsCollection();

    // ---- Send local cursor position into awareness ----
    const cursorDisposable = editor.onDidChangeCursorSelection(() => {
      const sel = editor.getSelection();
      if (!sel) return;
      awareness.setLocalStateField("cursor", {
        anchor: {
          line: sel.startLineNumber,
          ch: sel.startColumn,
        },
        head: {
          line: sel.positionLineNumber,
          ch: sel.positionColumn,
        },
      });
    });

    // ---- Render remote cursors from awareness ----
    const renderCursors = () => {
      const decs: monacoEditor.IModelDeltaDecoration[] = [];

      awareness.getStates().forEach((state, clientId) => {
        // Skip our own cursor
        if (clientId === awareness.clientID) return;
        if (!state.cursor || !state.user) return;

        const { cursor, user } = state;
        const color = user.color || "#ff0000";
        const name = user.name || "Anonymous";
        const id = clientId;

        // Inject dynamic CSS for this specific remote user
        let styleEl = document.getElementById(`rc-${id}`);
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = `rc-${id}`;
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = `
          .rc-cursor-${id} {
            border-left: 2px solid ${color};
          }
          .rc-cursor-${id}::after {
            content: '${name}';
            position: absolute;
            top: 0;
            left: -2px;
            transform: translateY(-100%);
            background: ${color};
            color: #fff;
            padding: 1px 6px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 3px 3px 3px 0;
            white-space: nowrap;
            pointer-events: none;
            z-index: 100;
            line-height: 16px;
          }
          .rc-sel-${id} {
            background-color: ${color}40;
          }
        `;

        // The coloured cursor bar
        decs.push({
          range: {
            startLineNumber: cursor.head.line,
            startColumn: cursor.head.ch,
            endLineNumber: cursor.head.line,
            endColumn: cursor.head.ch,
          },
          options: {
            beforeContentClassName: `rc-cursor-${id}`,
            stickiness: 1, // NeverGrowsWhenTypingAtEdges
          },
        });

        // Selection highlight (if user has text selected)
        const hasSelection =
          cursor.anchor.line !== cursor.head.line ||
          cursor.anchor.ch !== cursor.head.ch;

        if (hasSelection) {
          const startLine = Math.min(cursor.anchor.line, cursor.head.line);
          const endLine = Math.max(cursor.anchor.line, cursor.head.line);
          const startCol =
            startLine === cursor.anchor.line
              ? cursor.anchor.ch
              : cursor.head.ch;
          const endCol =
            endLine === cursor.anchor.line
              ? cursor.anchor.ch
              : cursor.head.ch;

          decs.push({
            range: {
              startLineNumber: startLine,
              startColumn: startCol,
              endLineNumber: endLine,
              endColumn: endCol,
            },
            options: {
              className: `rc-sel-${id}`,
              stickiness: 1,
            },
          });
        }
      });

      decorations.set(decs);
    };

    awareness.on("change", renderCursors);
    renderCursors(); // render any cursors already present

    return () => {
      cursorDisposable.dispose();
      awareness.off("change", renderCursors);
      decorations.clear();
      // Clean up dynamic style tags
      awareness.getStates().forEach((_, clientId) => {
        document.getElementById(`rc-${clientId}`)?.remove();
      });
    };
  }, [editor, awareness]);

  // ---- Mount: bind Y.Text for text-sync only ----
  const handleMount = useCallback(
    (ed: monacoEditor.IStandaloneCodeEditor) => {
      const model = ed.getModel();
      if (!model) return;

      // Text sync only — we handle cursors ourselves above
      new MonacoBinding(yText, model, new Set([ed]));
      setEditor(ed); // triggers the useEffect above
    },
    [yText]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
        <span className="text-gray-300 font-semibold text-sm">Editor (JavaScript)</span>
        <button
          onClick={runCode}
          disabled={isExecuting}
          className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded text-sm transition-colors"
        >
          {isExecuting ? "Running..." : "Run Code"}
        </button>
      </div>
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          onMount={handleMount}
        />
      </div>
    </div>
  );
}
