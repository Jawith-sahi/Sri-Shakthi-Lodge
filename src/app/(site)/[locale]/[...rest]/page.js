import { notFound } from "next/navigation";

// Catch-all so unknown URLs under a locale render the localised 404 page (with header + footer).
export default function CatchAll() {
  notFound();
}
