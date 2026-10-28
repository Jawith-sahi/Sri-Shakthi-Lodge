import { cn } from "@/lib/utils/cn";

const TONES = {
  amber: "bg-warning-50 text-warning-700 ring-warning-600/25",
  blue: "bg-primary-50 text-primary-700 ring-primary-500/30",
  green: "bg-success-50 text-success-700 ring-success-600/25",
  gray: "bg-surface text-muted ring-line",
  red: "bg-danger-50 text-danger-700 ring-danger-600/25",
};

/** Colour is never the only signal: the status always appears as text. */
export function StatusBadge({ tone = "gray", children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        TONES[tone] || TONES.gray,
        className
      )}
    >
      {children}
    </span>
  );
}

/** Convenience: badge from a { value: { label, tone } } map. */
export function MetaBadge({ value, meta }) {
  const item = meta[String(value)] || { label: String(value ?? "—"), tone: "gray" };
  return <StatusBadge tone={item.tone}>{item.label}</StatusBadge>;
}
