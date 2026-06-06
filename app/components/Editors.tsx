"use client";

import { useEffect, useState, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRoom } from "@/app/lib/RoomContext";
import { getLanguageConfig } from "@/app/lib/languages";
import LanguageSelector from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import { Play, Loader2, Lock, Gamepad2, Users } from "lucide-react";
import type { editor as monacoEditor } from "monaco-editor";
import { getStarterCode, isEditorEmpty } from "@/app/lib/problem-engine/starterCode";
import { useRef } from "react";

export default function Editor() {
  const { yText, awareness, runCode, isExecutingIndex, language, currentUser, driverId, editorLocked, hostId, users, problemMetadata } = useRoom();
  const [editor, setEditor] =
    useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  const { resolvedTheme } = useTheme();

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

  // Update Monaco theme when system theme changes
  useEffect(() => {
    if (!editor) return;
    const monacoInstance = (window as any).monaco;
    if (monacoInstance) {
      monacoInstance.editor.setTheme(resolvedTheme === "dark" ? "vs-dark" : "vs");
    }
  }, [editor, resolvedTheme]);

  const hasInjectedStarterCode = useRef(false);

  // Inject starter code when everything is ready
  useEffect(() => {
    if (!editor || !problemMetadata || !isHost) return;
    
    // Only inject once per session per host
    if (!hasInjectedStarterCode.current && isEditorEmpty(yText.toString())) {
      hasInjectedStarterCode.current = true;
      const starter = getStarterCode(problemMetadata, language);
      
      if (starter) {
        if (yText.length > 0) {
          yText.delete(0, yText.length);
        }
        yText.insert(0, starter);
      }
    }
  }, [editor, problemMetadata, isHost, language, yText]);

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
  const monacoTheme = resolvedTheme === "dark" ? "vs-dark" : "vs";
  const connectedCount = users?.length || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--ws-surface-elevated)] border-b border-[var(--ws-border)]">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <div className="w-px h-4 bg-[var(--ws-border)]" />
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium text-[var(--ws-text-muted)]">Live</span>
          </div>
          {connectedCount > 0 && (
            <>
              <div className="w-px h-4 bg-[var(--ws-border)]" />
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--ws-text-muted)]">
                <Users size={12} />
                <span className="font-medium">{connectedCount}</span>
              </div>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => runCode("all")}
            disabled={isExecutingIndex !== null}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[var(--ws-accent)] to-[#ffb84d] hover:from-[var(--ws-accent-hover)] hover:to-[#ffd280] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg text-xs shadow-[0_0_12px_var(--ws-accent-glow)] hover:shadow-[0_0_20px_var(--ws-accent-glow)] transition-all"
          >
            {isExecutingIndex !== null ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={13} fill="currentColor" />
                Run
              </>
            )}
          </button>
        </div>
      </div>

      {/* Read-only banner */}
      {(isReadOnly || editorLocked) && (
        <div className="mx-3 mt-2 mb-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-[11px] font-medium text-center shrink-0 flex items-center justify-center gap-1.5">
          {editorLocked ? (
            <>
              <Lock size={11} />
              {isHost ? "Editor Locked For Guests" : "Editor Locked By Host"}
            </>
          ) : (
            <>
              <Gamepad2 size={11} />
              Navigator Mode (Read-Only)
            </>
          )}
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 relative bg-[var(--ws-editor)]">
        <MonacoEditor
          height="100%"
          language={langConfig.monacoLanguage}
          theme={monacoTheme}
          onMount={handleMount}
          options={{ readOnly: isReadOnly }}
        />
      </div>
    </div>
  );
}
