import RoomLayout from "@/app/components/RoomLayout";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <RoomLayout roomId={roomId} />;
}