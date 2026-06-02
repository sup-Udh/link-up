import Editor from "@/app/components/Editors";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <div className="grid h-screen grid-cols-12">
      <div className="col-span-3 border-r">
        Problem Panel
      </div>

      <div className="col-span-7">
        <Editor />
      </div>

      <div className="col-span-2 border-l">
        Members
      </div>
    </div>
  );
}