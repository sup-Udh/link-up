"use client";

import MonacoEditor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRoom } from "@/app/lib/RoomContext";

export default function Editor() {
  const { yText, awareness } = useRoom();

  return (
    <MonacoEditor
      height="100vh"
      defaultLanguage="typescript"
      theme="vs-dark"
      onMount={(editor) => {
        const model = editor.getModel();
        if (!model) return;

        new MonacoBinding(
          yText,
          model,
          new Set([editor]),
          awareness
        );
      }}
    />
  );
}
