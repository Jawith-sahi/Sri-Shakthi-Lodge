"use client";

import { cn } from "@/lib/utils/cn";
import { FieldError } from "@/components/ui/FieldError";

const CONTROL =
  "block w-full rounded-lg border bg-white px-3.5 min-h-11 text-base text-ink placeholder:text-muted/70 " +
  "transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 " +
  "disabled:bg-surface disabled:text-muted";

function describedBy(id, error, hint) {
  return [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
}

/** Label + control + hint + error. `name` is used for the id so error summaries can link to the field. */
export function Field({ name, label, hint, error, required, optionalText, className, children }) {
  const id = `field-${name}`;
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-primary-900">
          {label}
          {required ? <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span> : null}
          {optionalText ? <span className="ml-1 font-normal text-muted">({optionalText})</span> : null}
        </label>
      ) : null}
      {children(id, describedBy(id, error, hint))}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function Input({ name, label, hint, error, required, optionalText, className, wrapperClassName, ref, ...props }) {
  return (
    <Field name={name} label={label} hint={hint} error={error} required={required} optionalText={optionalText} className={wrapperClassName}>
      {(id, describe) => (
        <input
          id={id}
          name={name}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describe}
          aria-required={required || undefined}
          className={cn(CONTROL, error ? "border-danger-600" : "border-line", className)}
          {...props}
        />
      )}
    </Field>
  );
}

export function Textarea({ name, label, hint, error, required, optionalText, className, wrapperClassName, rows = 4, ref, ...props }) {
  return (
    <Field name={name} label={label} hint={hint} error={error} required={required} optionalText={optionalText} className={wrapperClassName}>
      {(id, describe) => (
        <textarea
          id={id}
          name={name}
          ref={ref}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describe}
          aria-required={required || undefined}
          className={cn(CONTROL, "py-2.5", error ? "border-danger-600" : "border-line", className)}
          {...props}
        />
      )}
    </Field>
  );
}

export function Select({ name, label, hint, error, required, optionalText, className, wrapperClassName, children, ref, ...props }) {
  return (
    <Field name={name} label={label} hint={hint} error={error} required={required} optionalText={optionalText} className={wrapperClassName}>
      {(id, describe) => (
        <select
          id={id}
          name={name}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describe}
          aria-required={required || undefined}
          className={cn(CONTROL, "pr-9", error ? "border-danger-600" : "border-line", className)}
          {...props}
        >
          {children}
        </select>
      )}
    </Field>
  );
}

export function Checkbox({ name, label, error, className, ref, children, ...props }) {
  const id = `field-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-ink">
        <input
          id={id}
          name={name}
          ref={ref}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-line text-primary accent-[var(--color-primary-800)]"
          {...props}
        />
        <span>{label || children}</span>
      </label>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
