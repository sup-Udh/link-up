import RoomLayout from "@/app/components/RoomLayout";
import ProblemPanel from "@/app/components/ProblemPanel";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return (
    <RoomLayout 
      roomId={roomId} 
      problemPanel={<ProblemPanel roomId={roomId} />} 
    />
  );
}