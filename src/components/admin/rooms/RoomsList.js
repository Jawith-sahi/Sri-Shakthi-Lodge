"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { Button, LinkButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminList } from "@/hooks/useAdminList";
import { adminListRooms, deleteRoom, setRoomActive } from "@/lib/api/rooms.api";
import { formatINR } from "@/lib/utils/format";
import { pick } from "@/lib/utils/localize";

export function RoomsList() {
  const list = useAdminList(adminListRooms);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const columns = [
    {
      key: "name",
      header: "Room type",
      primary: true,
      render: (r) => (
        <Link href={`/admin/rooms/${r.id}/edit`} className="font-semibold text-primary hover:underline">
          {pick(r.name, "en")}
        </Link>
      ),
    },
    { key: "isAc", header: "A/C", render: (r) => (r.isAc ? "A/C" : "Non-A/C") },
    { key: "maxOccupancy", header: "Sleeps", render: (r) => r.maxOccupancy ?? "—" },
    { key: "roomNumbers", header: "Room numbers", hideOnMobile: true, render: (r) => (r.roomNumbers?.length ? r.roomNumbers.join(", ") : "—") },
    { key: "startingPrice", header: "From (per night)", render: (r) => formatINR(r.startingPrice) || "Not set" },
    {
      key: "isActive",
      header: "Status",
      render: (r) => <StatusBadge tone={r.isActive ? "green" : "gray"}>{r.isActive ? "Active" : "Inactive"}</StatusBadge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <LinkButton plain href={`/admin/rooms/${r.id}/edit`} variant="ghost" size="sm" aria-label={`Edit ${pick(r.name, "en")}`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </LinkButton>
          <Button variant="ghost" size="sm" onClick={() => setToggling(r)} aria-label={`${r.isActive ? "Deactivate" : "Activate"} ${pick(r.name, "en")}`}>
            <Power className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(r)} aria-label={`Delete ${pick(r.name, "en")}`}>
            <Trash2 className="h-4 w-4 text-danger-600" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Rooms"
        description="Room types guests can book. Prices come from Tariffs."
        actions={
          <LinkButton plain href="/admin/rooms/new">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add room
          </LinkButton>
        }
      />
      <FilterBar q={list.q} onQChange={list.setQ} placeholder="Search rooms…">
        <FilterSelect
          id="room-status"
          label="Status"
          value={list.filters.status || ""}
          onChange={(v) => list.setFilter("status", v)}
          options={[
            { value: "", label: "All" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        page={list.page}
        pageSize={list.pageSize}
        totalCount={list.totalCount}
        onPageChange={list.setPage}
        sort={list.sort}
        onSortChange={list.setSort}
        emptyTitle="No rooms yet"
        emptyBody='Use "Add room" to create the first room type.'
        caption="Rooms"
      />

      <ConfirmDialog
        open={Boolean(toggling)}
        onClose={() => setToggling(null)}
        title={toggling?.isActive ? "Deactivate this room?" : "Activate this room?"}
        message={
          toggling?.isActive
            ? "Guests will no longer be able to see or book this room type. Existing bookings are not changed."
            : "Guests will be able to see and book this room type again."
        }
        confirmLabel={toggling?.isActive ? "Deactivate" : "Activate"}
        danger={Boolean(toggling?.isActive)}
        onConfirm={async () => {
          await setRoomActive(toggling.id, !toggling.isActive);
          toast.success("Room updated.");
          list.reload();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this room?"
        message="This cannot be undone. Rooms that have bookings usually cannot be deleted – deactivate them instead."
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          await deleteRoom(deleting.id);
          toast.success("Room deleted.");
          list.reload();
        }}
      />
    </>
  );
}
