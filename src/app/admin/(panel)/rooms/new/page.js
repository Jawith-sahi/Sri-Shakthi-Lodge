import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RoomForm } from "@/components/admin/rooms/RoomForm";

export const metadata = { title: "Add room" };

export default function NewRoomPage() {
  return (
    <>
      <AdminPageHeader title="Add room" description="Create a new room type." />
      <RoomForm />
    </>
  );
}
