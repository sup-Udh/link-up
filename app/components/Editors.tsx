"use client";

import MonacoEditor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
// import { useRef } from "react";
// import * as Y from "yjs";

import { yText } from "@/app/lib/collaboration";


export default function Editor() {
  
  return (
     <MonacoEditor
      height="100vh"
      defaultLanguage="typescript"
      onMount={(editor) => {
        const model =
          editor.getModel();

        if (!model) return;

        new MonacoBinding(
          yText,
          model,
          new Set([editor]),
          null
        );
      }}
    />
  );
}


