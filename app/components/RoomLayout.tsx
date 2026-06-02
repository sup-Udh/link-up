"use client";

import dynamic from "next/dynamic";
import { RoomProvider } from "@/app/lib/RoomContext";
import Members from "./Members";

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
        <div className="col-span-7">
          <Editor />
        </div>
        <div className="col-span-2 border-l">
          <Members />
        </div>
      </div>
    </RoomProvider>
  );
}
