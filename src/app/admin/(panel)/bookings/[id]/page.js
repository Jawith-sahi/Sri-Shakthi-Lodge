import { BookingDetail } from "@/components/admin/bookings/BookingDetail";

export const metadata = { title: "Booking" };

export default async function AdminBookingPage({ params }) {
  const { id } = await params;
  return <BookingDetail id={id} />;
}
