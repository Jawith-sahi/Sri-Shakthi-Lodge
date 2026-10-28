import { Star } from "lucide-react";

export function Stars({ rating, label }) {
  const value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={i < value ? "h-4 w-4 fill-accent text-accent" : "h-4 w-4 text-line"}
        />
      ))}
    </span>
  );
}
