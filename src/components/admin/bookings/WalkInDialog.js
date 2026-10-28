"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Notice } from "@/components/ui/States";
import { adminCreateBooking } from "@/lib/api/bookings.api";
import { adminListRooms } from "@/lib/api/rooms.api";
import { getAdminErrorMessage } from "@/lib/api/errors";
import { walkInSchema } from "@/lib/schemas";
import { addDaysISO, todayIST } from "@/lib/utils/format";
import { pick } from "@/lib/utils/localize";

/** Manual / walk-in booking. The backend checks availability and sets the price. */
export function WalkInDialog({ open, onClose, onCreated }) {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(walkInSchema),
    defaultValues: { roomId: "", checkIn: "", checkOut: "", adults: 1, children: 0, rooms: 1, name: "", phone: "", email: "", notes: "" },
  });

  useEffect(() => {
    if (!open) return;
    const today = todayIST();
    reset({ roomId: "", checkIn: today, checkOut: addDaysISO(today, 1), adults: 1, children: 0, rooms: 1, name: "", phone: "", email: "", notes: "" });
    setError("");
    adminListRooms({ status: "active", pageSize: 100 })
      .then((res) => setRooms(res.items || []))
      .catch((e) => setError(getAdminErrorMessage(e)));
  }, [open, reset]);

  const onSubmit = async (values) => {
    setError("");
    try {
      const booking = await adminCreateBooking({
        roomId: values.roomId,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        adults: values.adults,
        children: values.children,
        rooms: values.rooms,
        guest: { name: values.name, phone: values.phone, email: values.email || undefined, notes: values.notes || undefined },
      });
      onCreated(booking);
    } catch (e) {
      setError(getAdminErrorMessage(e));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Walk-in booking" description="Create a booking for a guest at the desk." size="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {error ? <Notice tone="error">{error}</Notice> : null}
        <Select name="roomId" label="Room type" required error={errors.roomId?.message} {...register("roomId")}>
          <option value="">Choose a room type…</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {pick(r.name, "en")}
            </option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="checkIn" type="date" label="Check-in" required error={errors.checkIn?.message} {...register("checkIn")} />
          <Input name="checkOut" type="date" label="Check-out" required error={errors.checkOut?.message} {...register("checkOut")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input name="adults" type="number" min={1} label="Adults" error={errors.adults?.message} {...register("adults")} />
          <Input name="children" type="number" min={0} label="Children" error={errors.children?.message} {...register("children")} />
          <Input name="rooms" type="number" min={1} label="Rooms" error={errors.rooms?.message} {...register("rooms")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="name" label="Guest name" required error={errors.name?.message} {...register("name")} />
          <Input name="phone" type="tel" inputMode="numeric" label="Mobile number" required error={errors.phone?.message} {...register("phone")} />
        </div>
        <Input name="email" type="email" label="Email" optionalText="optional" error={errors.email?.message} {...register("email")} />
        <Textarea name="notes" label="Notes" optionalText="optional" rows={2} error={errors.notes?.message} {...register("notes")} />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Create booking</Button>
        </div>
      </form>
    </Modal>
  );
}
