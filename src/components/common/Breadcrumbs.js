import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

/** Visible breadcrumb trail. Pair with breadcrumbJsonLd() for structured data. items: [{ name, href? }] */
export function Breadcrumbs({ items, label = "Breadcrumb" }) {
  return (
    <nav aria-label={label} className="container-page pt-6 text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.name} className="inline-flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-primary hover:underline">
                  {item.name}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "font-medium text-primary-900" : undefined}>
                  {item.name}
                </span>
              )}
              {!last ? <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
