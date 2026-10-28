import { cn } from "@/lib/utils/cn";

/** Consistent section title. `as` lets the page choose h1 (once per page) or h2. */
export function SectionHeading({ title, subtitle, as: Tag = "h2", align = "left", className, id }) {
  return (
    <div className={cn("mb-8", align === "center" && "text-center", className)}>
      <Tag id={id} className={cn("text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl", Tag === "h1" && "sm:text-4xl")}>
        {title}
      </Tag>
      <div className={cn("mt-3 h-1 w-12 rounded-full bg-accent", align === "center" && "mx-auto")} aria-hidden="true" />
      {subtitle ? <p className={cn("mt-4 max-w-2xl text-base text-muted", align === "center" && "mx-auto")}>{subtitle}</p> : null}
    </div>
  );
}
