"use client";
import Editor from "@/app/components/Editor";
import Members from "@/components/Members";
import ProblemPanel from "@/components/ProblemPanel";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const createRoom = () => {
    const roomId = crypto.randomUUID().slice(0, 8);
    router.push(`/room/${roomId}`);
  };

  return (
    <main className="flex h-screen items-center justify-center">
      <button
        onClick={createRoom}
        className="rounded bg-black px-6 py-3 text-white"
      >
        Start Session
      </button>
    </main>
  );
}