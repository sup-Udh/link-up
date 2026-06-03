"use client";

import { useEffect, useState, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRoom } from "@/app/lib/RoomContext";
import { getLanguageConfig } from "@/app/lib/languages";
import LanguageSelector from "./LanguageSelector";
import type { editor as monacoEditor } from "monaco-editor";

export default function Editor() {
  const { yText, awareness, runCode, isExecuting, language, currentUser, driverId, editorLocked, hostId } = useRoom();
  const [editor, setEditor] =
    useState<monacoEditor.IStandaloneCodeEditor | null>(null);

  const isHost = currentUser?.id === hostId;
  
  let isReadOnly = false;
  if (editorLocked) {
    isReadOnly = !isHost;
  } else if (driverId !== null) {
    isReadOnly = currentUser?.id !== driverId;
  }

  useEffect(() => {
    if (!editor) return;
    editor.updateOptions({ readOnly: isReadOnly });
  }, [editor, isReadOnly]);

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

    let typingTimeout: any;
    const modelDisposable = editor.onDidChangeModelContent(() => {
      awareness.setLocalStateField("typing", true);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        awareness.setLocalStateField("typing", false);
      }, 1000);
    });

    // ---- Render remote cursors from awareness ----
    const renderCursors = () => {
      const decs: monacoEditor.IModelDeltaDecoration[] = [];

      awareness.getStates().forEach((state: any, clientId: number) => {
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
      clearTimeout(typingTimeout);
      modelDisposable.dispose();
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

  const langConfig = getLanguageConfig(language);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <span className="text-gray-300 font-semibold text-sm">Editor</span>
          <LanguageSelector />
        </div>
        <button
          onClick={runCode}
          disabled={isExecuting}
          className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded text-sm transition-colors"
        >
          {isExecuting ? "Running..." : "Run Code"}
        </button>
      </div>
      {(isReadOnly || editorLocked) && (
        <div className="w-full bg-yellow-600/90 text-white text-xs font-bold text-center py-1.5 shadow-md uppercase tracking-wider pointer-events-none shrink-0 border-b border-yellow-700">
          {editorLocked 
            ? (isHost ? "🔒 Editor Locked For Guests" : "🔒 Editor Locked By Host") 
            : "🎮 Navigator Mode (Read-Only)"}
        </div>
      )}
      <div className="flex-1 relative">
        <MonacoEditor
          height="100%"
          language={langConfig.monacoLanguage}
          theme="vs-dark"
          onMount={handleMount}
          options={{ readOnly: isReadOnly }}
        />
      </div>
    </div>
  );
}
