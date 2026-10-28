"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Notice } from "@/components/ui/States";
import { MetaBadge } from "@/components/ui/StatusBadge";
import { ENQUIRY_STATUS_META } from "@/constants/statuses";
import { useAdminList } from "@/hooks/useAdminList";
import { adminListEnquiries, adminUpdateEnquiry } from "@/lib/api/enquiries.api";
import { getAdminErrorMessage } from "@/lib/api/errors";
import { formatDateTimeIST } from "@/lib/utils/format";

function EnquiryDialog({ enquiry, onClose, onSaved }) {
  const [status, setStatus] = useState("read");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enquiry) return;
    setStatus(enquiry.status === "new" ? "read" : enquiry.status);
    setNotes(enquiry.notes || "");
    setError("");
  }, [enquiry]);

  async function save() {
    setBusy(true);
    setError("");
    try {
      await adminUpdateEnquiry(enquiry.id, { status, notes });
      toast.success("Enquiry updated.");
      onSaved();
    } catch (e) {
      setError(getAdminErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={Boolean(enquiry)}
      onClose={onClose}
      title={enquiry?.subject || "Enquiry"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={save} loading={busy}>Save</Button>
        </>
      }
    >
      {enquiry ? (
        <div className="space-y-4 text-sm">
          {error ? <Notice tone="error">{error}</Notice> : null}
          <dl className="grid gap-2 sm:grid-cols-2">
            <div><dt className="text-muted">From</dt><dd className="font-medium">{enquiry.name}</dd></div>
            <div><dt className="text-muted">Received (IST)</dt><dd>{formatDateTimeIST(enquiry.createdAt, "en")}</dd></div>
            <div><dt className="text-muted">Phone</dt><dd><a className="text-primary underline" href={`tel:+91${enquiry.phone}`}>{enquiry.phone}</a></dd></div>
            <div><dt className="text-muted">Email</dt><dd>{enquiry.email || "—"}</dd></div>
          </dl>
          <div>
            <p className="text-muted">Message</p>
            {/* Plain text only: visitor input is never rendered as HTML */}
            <p className="mt-1 whitespace-pre-line rounded-lg bg-surface p-3 text-ink">{enquiry.message}</p>
          </div>
          <div>
            <label htmlFor="enq-status" className="mb-1 block font-medium text-primary-900">Status</label>
            <select id="enq-status" value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 rounded-lg border border-line bg-white px-3 text-base">
              {Object.entries(ENQUIRY_STATUS_META).map(([value, m]) => (
                <option key={value} value={value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="enq-notes" className="mb-1 block font-medium text-primary-900">Internal notes</label>
            <textarea id="enq-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-line px-3 py-2 text-base" />
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export function EnquiriesList() {
  const list = useAdminList(adminListEnquiries, { initialSort: { key: "createdAt", dir: "desc" } });
  const [selected, setSelected] = useState(null);

  const columns = [
    { key: "subject", header: "Subject", primary: true, render: (e) => <span className="font-semibold text-primary-900">{e.subject}</span> },
    { key: "name", header: "From", render: (e) => e.name },
    { key: "phone", header: "Phone", hideOnMobile: true, render: (e) => e.phone },
    { key: "createdAt", header: "Received (IST)", sortable: true, render: (e) => formatDateTimeIST(e.createdAt, "en") },
    { key: "status", header: "Status", render: (e) => <MetaBadge value={e.status} meta={ENQUIRY_STATUS_META} /> },
    { key: "actions", header: "", className: "text-right", render: (e) => <Button variant="ghost" size="sm" onClick={() => setSelected(e)}>Open</Button> },
  ];

  return (
    <>
      <AdminPageHeader title="Enquiries" description="Messages sent from the website contact form." />
      <FilterBar q={list.q} onQChange={list.setQ} placeholder="Name, phone, subject…">
        <FilterSelect
          id="enq-filter"
          label="Status"
          value={list.filters.status || ""}
          onChange={(v) => list.setFilter("status", v)}
          options={[{ value: "", label: "All" }, ...Object.entries(ENQUIRY_STATUS_META).map(([value, m]) => ({ value, label: m.label }))]}
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
        onRowClick={setSelected}
        emptyTitle="No enquiries yet"
        caption="Enquiries"
      />
      <EnquiryDialog
        enquiry={selected}
        onClose={() => setSelected(null)}
        onSaved={() => {
          setSelected(null);
          list.reload();
        }}
      />
    </>
  );
}
