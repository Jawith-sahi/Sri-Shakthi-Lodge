// Tiny class-name joiner (no dependency needed).
export function cn(...parts) {
  return parts
    .flat(Infinity)
    .filter(Boolean)
    .join(" ");
}
