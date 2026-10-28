import { env } from "@/config/environment";

/** Shown only in local mock mode so sample data can never be mistaken for real information. */
export function MockBanner({ text }) {
  if (!env.useMock) return null;
  return (
    <div role="note" className="bg-warning-600 px-4 py-2 text-center text-xs font-semibold text-white print:hidden">
      {text || "DEVELOPMENT MODE – sample data only. Nothing shown here is real."}
    </div>
  );
}
