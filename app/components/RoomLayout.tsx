"use client";

import dynamic from "next/dynamic";
import { RoomProvider } from "@/app/lib/RoomContext";
import Members from "./Members";
import ProblemPanel from "./ProblemPanel";

const Editor = dynamic(() => import("./Editors"), { ssr: false });

export default function RoomLayout({ roomId }: { roomId: string }) {
  return (
    <RoomProvider roomId={roomId}>
      <div className="grid h-screen bg-gray-500 grid-cols-12">
        <div className="col-span-3 border-r">
          <ProblemPanel />
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
