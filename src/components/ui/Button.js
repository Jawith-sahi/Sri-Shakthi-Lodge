import NextLink from "next/link";
import { Link as IntlLink } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui/Spinner";

const VARIANTS = {
  primary: "bg-primary text-white hover:bg-primary-800 focus-visible:outline-accent-500",
  accent: "bg-accent text-primary-950 hover:bg-accent-400 font-semibold",
  outline: "border border-primary-300 bg-white text-primary hover:bg-primary-50",
  ghost: "text-primary hover:bg-primary-50",
  danger: "bg-danger-600 text-white hover:bg-danger-700",
  success: "bg-success-600 text-white hover:bg-success-700",
  light: "bg-white text-primary hover:bg-primary-50",
};

const SIZES = {
  sm: "min-h-9 px-3 text-sm gap-1.5",
  md: "min-h-11 px-4 text-sm gap-2",
  lg: "min-h-12 px-6 text-base gap-2",
};

export function buttonClasses({ variant = "primary", size = "md", className, fullWidth } = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150",
    "disabled:cursor-not-allowed disabled:opacity-60 select-none",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className
  );
}

export function Button({ variant, size, fullWidth, loading = false, disabled, className, children, type = "button", ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className, fullWidth })}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

/**
 * Link styled as a button.
 *  - default: locale-aware link for public pages
 *  - plain:   next/link (admin, which is not locale-prefixed)
 *  - external: <a> (tel:, wa.me, maps…)
 */
export function LinkButton({ href, variant, size, fullWidth, className, plain, external, children, ...props }) {
  const classes = buttonClasses({ variant, size, className, fullWidth });
  if (external) {
    const isWeb = /^https?:/i.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(isWeb ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  }
  const Component = plain ? NextLink : IntlLink;
  return (
    <Component href={href} className={classes} {...props}>
      {children}
    </Component>
  );
}
