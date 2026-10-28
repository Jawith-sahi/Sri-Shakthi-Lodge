import { ChevronDown } from "lucide-react";

/** Native <details> accordion: accessible, keyboard friendly and works without JavaScript. */
export function FaqList({ items }) {
  if (!items?.length) return null;
  return (
    <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
      {items.map((item) => (
        <details key={item.id} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-medium text-primary-900 hover:bg-surface [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <ChevronDown className="h-5 w-5 shrink-0 text-primary-500 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="px-4 pb-4 text-ink">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
