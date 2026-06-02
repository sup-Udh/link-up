import Editor  from "@/app/components/Editors";
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
        Editor
      <Editor roomId={roomId} />
      </div>

      <div className="col-span-2 border-l">
       <Members roomId={roomId} />
      </div>
    </div>
  );
}