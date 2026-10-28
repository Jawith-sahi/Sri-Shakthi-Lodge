"use client";

import { useEffect, useState } from "react";
import { RoomForm } from "@/components/admin/rooms/RoomForm";
import { Button, LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { Skeleton } from "@/components/ui/Skeleton";
import { adminGetRoom } from "@/lib/api/rooms.api";
import { getAdminErrorMessage } from "@/lib/api/errors";

export function RoomEditLoader({ id }) {
  const [state, setState] = useState({ loading: true, room: null, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ loading: true, room: null, error: null });
    adminGetRoom(id)
      .then((room) => alive && setState({ loading: false, room, error: null }))
      .catch((e) => alive && setState({ loading: false, room: null, error: e }));
    return () => {
      alive = false;
    };
  }, [id, tick]);

  if (state.loading) return <Skeleton className="h-96 w-full" />;
  if (state.error) {
    return (
      <ErrorState
        title={state.error.code === "not_found" ? "Room not found" : "We could not load this room"}
        body={getAdminErrorMessage(state.error)}
        action={
          <>
            <Button variant="outline" onClick={() => setTick((n) => n + 1)}>Try again</Button>
            <LinkButton plain href="/admin/rooms" variant="ghost">Back to rooms</LinkButton>
          </>
        }
      />
    );
  }
  return <RoomForm room={state.room} />;
}
