import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { lodge } from "@/config/lodge";
import { cn } from "@/lib/utils/cn";

/**
 * Logo + name. The emblem is the client's supplied logo (public/logo.png, cropped to a circle).
 * Replace the file to change the logo; the text beside it keeps the full lodge name visible.
 */
export function BrandMark({ light = false, className, priority = false }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label={`${lodge.name} – home`}>
      <Image
        src="/logo-small.png"
        alt=""
        width={44}
        height={44}
        priority={priority}
        className="h-11 w-11 rounded-full"
      />
      <span className="flex flex-col leading-tight">
        <span className={cn("text-lg font-bold tracking-tight", light ? "text-white" : "text-primary-900")}>{lodge.name}</span>
        <span className={cn("text-[0.7rem] font-medium uppercase tracking-[0.14em]", light ? "text-accent-300" : "text-accent-700")}>
          {lodge.address.district.replace(" District", "")}
        </span>
      </span>
    </Link>
  );
}
