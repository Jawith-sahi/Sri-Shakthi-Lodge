"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Built on the native <dialog> element: focus trapping, Escape-to-close and screen-reader semantics come from the browser.
function useDialog(open, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    }
    if (!open && dialog.open) dialog.close();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      document.body.style.overflow = "";
      onClose?.();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const onBackdropClick = (event) => {
    if (event.target === ref.current) ref.current.close();
  };

  return { ref, onBackdropClick };
}

const SIZES = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

export function Modal({ open, onClose, title, description, size = "md", closeLabel = "Close", children, footer, className }) {
  const { ref, onBackdropClick } = useDialog(open, onClose);
  const titleId = useId();
  const descId = useId();

  return (
    <dialog
      ref={ref}
      onClick={onBackdropClick}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      className={cn(
        "m-auto w-[calc(100%-1.5rem)] rounded-2xl bg-white p-0 text-ink shadow-[var(--shadow-pop)]",
        "backdrop:bg-primary-950/55",
        SIZES[size],
        className
      )}
    >
      {open ? (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              {title ? (
                <h2 id={titleId} className="text-lg font-semibold text-primary-900">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p id={descId} className="mt-1 text-sm text-muted">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label={closeLabel}
              className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
          {footer ? <div className="flex flex-wrap justify-end gap-3 border-t border-line px-5 py-4">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}

/** Slide-in panel (mobile menus, admin filters). */
export function Drawer({ open, onClose, title, side = "right", closeLabel = "Close", children, className }) {
  const { ref, onBackdropClick } = useDialog(open, onClose);
  const titleId = useId();

  return (
    <dialog
      ref={ref}
      onClick={onBackdropClick}
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-white p-0 text-ink shadow-[var(--shadow-pop)]",
        "backdrop:bg-primary-950/55",
        side === "right" ? "ml-auto" : "mr-auto",
        className
      )}
    >
      {open ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 id={titleId} className="text-base font-semibold text-primary-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label={closeLabel}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-surface"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}
