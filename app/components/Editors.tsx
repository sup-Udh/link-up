"use client";

import { useEffect, useState, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRoom } from "@/app/lib/RoomContext";
import { getLanguageConfig, SUPPORTED_LANGUAGES } from "@/app/lib/languages";
import LanguageSelector from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import { Play, Loader2, Lock, Gamepad2, Users, Code2, Link as LinkIcon, Copy, Check } from "lucide-react";
import type { editor as monacoEditor } from "monaco-editor";
import { getStarterCode, isEditorEmpty } from "@/app/lib/problem-engine/starterCode";
import { useRef } from "react";

export default function Editor() {
  const { yText, awareness, runCode, isExecutingIndex, language, changeLanguage, currentUser, driverId, editorLocked, hostId, users, problemMetadata } = useRoom();
  const [editor, setEditor] =
    useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  const { resolvedTheme } = useTheme();
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasCheckedEmpty, setHasCheckedEmpty] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  // Check if editor is empty on load, and prompt host to select language
  useEffect(() => {
    if (!editor || !problemMetadata || hasCheckedEmpty) return;
    
    // Mark as checked so we only do this once per editor load
    setHasCheckedEmpty(true);
    
    if (isHost && isEditorEmpty(yText.toString())) {
      setShowLanguageModal(true);
    }
  }, [editor, problemMetadata, isHost, yText, hasCheckedEmpty]);

  const handleInitialLanguageSelect = (langId: string) => {
    changeLanguage(langId);
    setShowLanguageModal(false);
    setShowInviteModal(true);
  };

  // Cursor styling (y-monaco handles the actual positioning)
  useEffect(() => {
    if (!editor || !awareness) return;

    let typingTimeout: any;
    const modelDisposable = editor.onDidChangeModelContent(() => {
      awareness.setLocalStateField("typing", true);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        awareness.setLocalStateField("typing", false);
      }, 1000);
    });

    // ---- Render remote cursors styles ----
    const renderCursorStyles = () => {
      awareness.getStates().forEach((state: any, clientId: number) => {
        // Skip our own cursor
        if (clientId === awareness.clientID) return;
        if (!state.user) return;

        const { user } = state;
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
          .yRemoteSelectionHead-${id} {
            position: absolute;
            border-left: 2px solid ${color};
            height: 100%;
            box-sizing: border-box;
          }
          .yRemoteSelectionHead-${id}::after {
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
          .yRemoteSelection-${id} {
            background-color: ${color}40;
          }
        `;
      });
    };

    awareness.on("change", renderCursorStyles);
    renderCursorStyles(); // render any cursors already present

    return () => {
      clearTimeout(typingTimeout);
      modelDisposable.dispose();
      awareness.off("change", renderCursorStyles);
      // Clean up dynamic style tags
      awareness.getStates().forEach((_, clientId) => {
        document.getElementById(`rc-${clientId}`)?.remove();
      });
    };
  }, [editor, awareness]);

  // ---- Mount: bind Y.Text and Awareness ----
  const handleMount = useCallback(
    (ed: monacoEditor.IStandaloneCodeEditor) => {
      const model = ed.getModel();
      if (!model) return;

      // Text and cursor sync via y-monaco
      new MonacoBinding(yText, model, new Set([ed]), awareness);
      setEditor(ed); // triggers the useEffect above
    },
    [yText, awareness]
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

        {/* Initial Language Selection Modal */}
        {showLanguageModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center">
            <div className="bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-2xl p-6 shadow-2xl w-[320px] max-w-[90%]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--ws-accent)] to-[#ffb84d] flex items-center justify-center shadow-lg shadow-[var(--ws-accent-glow)] shrink-0">
                  <Code2 size={20} className="text-black" />
                </div>
                <div>
                  <h3 className="text-[var(--ws-text)] font-semibold">Choose Language</h3>
                  <p className="text-[var(--ws-text-muted)] text-[11px]">Select a starting language</p>
                </div>
              </div>
              
              <div className="space-y-2 max-h-[240px] overflow-y-auto ws-scrollbar pr-2 mb-4">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleInitialLanguageSelect(lang.id)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[var(--ws-surface-hover)] border border-transparent hover:border-[var(--ws-border-hover)] transition-all group"
                  >
                    <span className="text-sm font-medium text-[var(--ws-text-secondary)] group-hover:text-[var(--ws-text)] transition-colors">
                      {lang.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Invite Link Modal */}
        {showInviteModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center">
            <div className="bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-2xl p-6 shadow-2xl w-[360px] max-w-[90%]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                  <LinkIcon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[var(--ws-text)] font-semibold">Invite Collaborators</h3>
                  <p className="text-[var(--ws-text-muted)] text-[11px]">Share this link to code together</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <input 
                  type="text" 
                  readOnly 
                  value={typeof window !== "undefined" ? window.location.href : ""} 
                  className="flex-1 bg-[var(--ws-surface)] border border-[var(--ws-border)] text-[var(--ws-text)] rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-[var(--ws-surface-hover)] hover:bg-[var(--ws-surface-elevated)] text-[var(--ws-text)] border border-[var(--ws-border)] transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>

              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full bg-[var(--ws-accent)] hover:bg-[var(--ws-accent-hover)] text-black font-semibold py-3 rounded-xl transition-all shadow-lg shadow-[var(--ws-accent-glow)]"
              >
                Start Coding
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
