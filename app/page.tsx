"use client";
import Editor from "@/app/components/Editors";
import Members from "@/app/components/Members";
import ProblemPanel from "@/app/components/ProblemPanel";

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