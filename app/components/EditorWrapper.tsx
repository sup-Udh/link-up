"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./Editors"), { ssr: false });

export default function EditorWrapper({ roomId }: { roomId: string }) {
  return <Editor roomId={roomId} />;
}
