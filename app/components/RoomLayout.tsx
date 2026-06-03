"use client";

import dynamic from "next/dynamic";
import { RoomProvider } from "@/app/lib/RoomContext";
import Members from "./Members";
import BottomPanel from "./BottomPanel";

const Editor = dynamic(() => import("./Editors"), { ssr: false });

export default function RoomLayout({ 
  roomId,
  problemPanel
}: { 
  roomId: string;
  problemPanel: React.ReactNode;
}) {
  return (
    <RoomProvider roomId={roomId}>
      <div className="grid h-screen bg-gray-500 grid-cols-12">
        <div className="col-span-3 border-r bg-[#282828] overflow-hidden">
          {problemPanel}
        </div>
        <div className="col-span-7 flex flex-col h-full bg-[#1e1e1e]">
          <div className="flex-1 overflow-hidden">
            <Editor />
          </div>
          <div className="h-64 shrink-0 border-t border-gray-700">
            <BottomPanel />
          </div>
        </div>
        <div className="col-span-2 border-l">
          <Members />
        </div>
      </div>
    </RoomProvider>
  );
}
