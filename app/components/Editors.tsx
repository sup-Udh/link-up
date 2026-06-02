"use client";

import MonacoEditor from "@monaco-editor/react";

export default function Editor() {
  return (
    <MonacoEditor
      height="100vh"
      defaultLanguage="typescript"
      defaultValue="// Start coding..."
    />
  );
}