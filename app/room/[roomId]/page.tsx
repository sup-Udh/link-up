import EditorWrapper from "@/app/components/EditorWrapper";
import ProblemPanel from "@/app/components/ProblemPanel";
import Members from "@/app/components/Members";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <div className="grid h-screen bg-gray-500 grid-cols-12">
      <div className="col-span-3 border-r">
        <ProblemPanel/>
      </div>

      <div className="col-span-7">
        <EditorWrapper roomId={roomId} />
      </div>

      <div className="col-span-2 border-l">
       <Members roomId={roomId} />
      </div>
    </div>
  );
}