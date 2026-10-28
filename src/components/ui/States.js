import { AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({ title, body, action, icon: Icon = Inbox, className }) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-dashed border-line bg-surface px-6 py-12 text-center", className)}>
      <Icon className="mx-auto h-10 w-10 text-primary-300" aria-hidden="true" />
      <h3 className="mt-4 text-lg font-semibold text-primary-900">{title}</h3>
      {body ? <p className="mx-auto mt-2 max-w-md text-muted">{body}</p> : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title, body, action, className }) {
  return (
    <div
      role="alert"
      className={cn("rounded-[var(--radius-card)] border border-danger-600/25 bg-danger-50 px-6 py-10 text-center", className)}
    >
      <AlertTriangle className="mx-auto h-10 w-10 text-danger-600" aria-hidden="true" />
      <h3 className="mt-4 text-lg font-semibold text-danger-700">{title}</h3>
      {body ? <p className="mx-auto mt-2 max-w-md text-danger-700/90">{body}</p> : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

/** Small inline notice (info / success / warning / error). */
export function Notice({ tone = "info", title, children, className }) {
  const tones = {
    info: "border-primary-200 bg-primary-50 text-primary-900",
    success: "border-success-600/30 bg-success-50 text-success-700",
    warning: "border-warning-600/30 bg-warning-50 text-warning-700",
    error: "border-danger-600/30 bg-danger-50 text-danger-700",
  };
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-lg border px-4 py-3 text-sm", tones[tone], className)}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={title ? "mt-1" : undefined}>{children}</div> : null}
    </div>
  );
}
