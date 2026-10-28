import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RoomEditLoader } from "@/components/admin/rooms/RoomEditLoader";

export const metadata = { title: "Edit room" };

export default async function EditRoomPage({ params }) {
  const { id } = await params;
  return (
    <>
      <AdminPageHeader title="Edit room" />
      <RoomEditLoader id={id} />
    </>
  );
}
