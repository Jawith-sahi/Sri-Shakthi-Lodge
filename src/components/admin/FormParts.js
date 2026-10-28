"use client";

import { Button } from "@/components/ui/Button";

/** Cancel / Save row used at the bottom of dialog forms. */
export function FormActions({ onCancel, submitting, submitLabel = "Save" }) {
  return (
    <div className="flex justify-end gap-3 border-t border-line pt-4">
      <Button variant="outline" onClick={onCancel} disabled={submitting}>
        Cancel
      </Button>
      <Button type="submit" loading={submitting}>
        {submitLabel}
      </Button>
    </div>
  );
}

export const emptyToUndefined = (v) => (v === "" || v === null || Number.isNaN(v) ? undefined : v);
