"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Notice } from "@/components/ui/States";
import { useAdminList } from "@/hooks/useAdminList";
import { getAdminErrorMessage } from "@/lib/api/errors";

/**
 * Generic "list + create/edit in a dialog + delete with confirmation" screen, reused by
 * Tariffs, Offers, Gallery and Attractions.
 *
 * config: { title, description, singular, fetcher, create, update, remove, columns(actions), Form, statusOptions?, searchPlaceholder? }
 *  - Form receives { initial, onSubmit(values), onCancel, submitting }
 *  - columns is a function ({ onEdit, onDelete }) => column[] so the table can render action buttons
 */
export function ResourceManager({ config }) {
  const list = useAdminList(config.fetcher);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, row = edit
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const { Form } = config;
  const isNew = editing && !editing.id;

  async function save(values) {
    setSubmitting(true);
    setFormError("");
    try {
      if (isNew) await config.create(values);
      else await config.update(editing.id, values);
      toast.success(`${config.singular} saved.`);
      setEditing(null);
      list.reload();
    } catch (error) {
      setFormError(getAdminErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = config.columns({
    onEdit: (row) => {
      setFormError("");
      setEditing(row);
    },
    onDelete: (row) => setDeleting(row),
  });

  return (
    <div>
      <AdminPageHeader
        title={config.title}
        description={config.description}
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setFormError("");
              setEditing({});
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add {config.singular.toLowerCase()}
          </Button>
        }
      />

      <FilterBar q={list.q} onQChange={list.setQ} placeholder={config.searchPlaceholder}>
        {config.statusOptions ? (
          <FilterSelect
            id="status-filter"
            label="Status"
            value={list.filters.status || ""}
            onChange={(v) => list.setFilter("status", v)}
            options={config.statusOptions}
          />
        ) : null}
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
        emptyTitle={`No ${config.title.toLowerCase()} yet`}
        emptyBody={`Use "Add ${config.singular.toLowerCase()}" to create the first one.`}
        caption={config.title}
      />

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={isNew ? `Add ${config.singular.toLowerCase()}` : `Edit ${config.singular.toLowerCase()}`}
        size="lg"
      >
        {editing ? (
          <>
            {formError ? (
              <Notice tone="error" className="mb-4">
                {formError}
              </Notice>
            ) : null}
            <Form initial={editing} onSubmit={save} onCancel={() => setEditing(null)} submitting={submitting} />
          </>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete ${config.singular.toLowerCase()}?`}
        message="This cannot be undone. If the system does not allow deleting it, you will see why."
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          await config.remove(deleting.id);
          toast.success(`${config.singular} deleted.`);
          list.reload();
        }}
      />
    </div>
  );
}
