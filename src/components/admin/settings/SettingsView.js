"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { MetaBadge } from "@/components/ui/StatusBadge";
import { Notice } from "@/components/ui/States";
import { changePassword } from "@/lib/api/auth.api";
import { getAdminErrorMessage } from "@/lib/api/errors";
import { createStaff, listStaff, updateStaff } from "@/lib/api/staff.api";
import { changePasswordSchema, staffSchema } from "@/lib/schemas";

function PasswordCard() {
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (v) => {
    setBusy(true);
    try {
      await changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword });
      toast.success("Password changed.");
      reset();
    } catch (e) {
      toast.error(getAdminErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-white p-5">
      <h2 className="text-lg font-semibold text-primary-900">Change password</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 max-w-md space-y-4">
        <Input name="currentPassword" type="password" autoComplete="current-password" label="Current password" required error={errors.currentPassword?.message} {...register("currentPassword")} />
        <Input name="newPassword" type="password" autoComplete="new-password" label="New password" required hint="At least 8 characters." error={errors.newPassword?.message} {...register("newPassword")} />
        <Input name="confirmPassword" type="password" autoComplete="new-password" label="Confirm new password" required error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <Button type="submit" loading={busy}>Change password</Button>
      </form>
    </section>
  );
}

function StaffDialog({ open, onClose, onCreated }) {
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", username: "", role: "staff", password: "" },
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const onSubmit = async (v) => {
    setBusy(true);
    try {
      await createStaff(v);
      toast.success("User added.");
      onCreated();
      onClose();
    } catch (e) {
      toast.error(getAdminErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a user">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input name="name" label="Full name" required error={errors.name?.message} {...register("name")} />
        <Input name="username" label="Username" required autoComplete="off" error={errors.username?.message} {...register("username")} />
        <Select name="role" label="Role" {...register("role")}>
          <option value="staff">Staff</option>
          <option value="owner">Owner</option>
        </Select>
        <Input name="password" type="password" autoComplete="new-password" label="Temporary password" required hint="At least 8 characters. Ask them to change it after signing in." error={errors.password?.message} {...register("password")} />
        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" loading={busy}>Add user</Button>
        </div>
      </form>
    </Modal>
  );
}

function StaffCard() {
  const { user } = useAdmin();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listStaff()
      .then((s) => alive && (setStaff(s), setError(null)))
      .catch((e) => alive && setError(getAdminErrorMessage(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [version]);

  const toggleActive = async (u) => {
    try {
      await updateStaff(u.id, { isActive: !u.isActive });
      toast.success(u.isActive ? "User deactivated." : "User activated.");
      setVersion((v) => v + 1);
    } catch (e) {
      toast.error(getAdminErrorMessage(e));
    }
  };

  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-primary-900">Users</h2>
        <Button onClick={() => setAdding(true)}>Add user</Button>
      </div>
      {error ? <Notice tone="error" className="mt-4">{error}</Notice> : null}
      {loading ? <p className="mt-4 text-sm text-muted">Loading…</p> : null}
      <ul className="mt-4 divide-y divide-line">
        {staff.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-semibold text-primary-900">{u.name}</p>
              <p className="text-sm text-muted">{u.username} · <span className="capitalize">{u.role}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <MetaBadge value={u.isActive ? "active" : "inactive"} meta={{ active: { label: "Active", tone: "green" }, inactive: { label: "Inactive", tone: "gray" } }} />
              {u.id !== user?.id ? (
                <Button variant="outline" size="sm" onClick={() => toggleActive(u)}>{u.isActive ? "Deactivate" : "Activate"}</Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <StaffDialog open={adding} onClose={() => setAdding(false)} onCreated={() => setVersion((v) => v + 1)} />
    </section>
  );
}

export function SettingsView() {
  const { isOwner } = useAdmin();
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Settings" description="Your account and, for owners, the people who can sign in." />
      <PasswordCard />
      {isOwner ? <StaffCard /> : <Notice tone="info">User management is available to the owner only.</Notice>}
    </div>
  );
}
