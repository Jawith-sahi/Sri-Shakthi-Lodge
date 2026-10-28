import { cn } from "@/lib/utils/cn";

/** Page section with consistent vertical rhythm. tone="muted" gives the light grey band. */
export function Section({ tone = "white", className, children, id, labelledBy }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-12 sm:py-16", tone === "muted" && "bg-surface", className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}
