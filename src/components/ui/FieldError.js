"use client";

import { useTranslations } from "next-intl";

/** Translates validation message keys ("validation.required") and shows plain API messages as-is. */
export function useValidationText() {
  const t = useTranslations("validation");
  return (message) => {
    if (!message) return "";
    if (typeof message === "string" && message.startsWith("validation.")) {
      const key = message.slice("validation.".length);
      try {
        return t(key);
      } catch {
        return message;
      }
    }
    return String(message);
  };
}

export function FieldError({ id, message }) {
  const text = useValidationText();
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-danger-600">
      {text(message)}
    </p>
  );
}

/** Accessible summary shown at the top of long forms after a failed submit. */
export function FormErrorSummary({ errors, labels = {}, title, focusRef }) {
  const text = useValidationText();
  const entries = Object.entries(errors || {}).filter(([, v]) => v?.message);
  if (!entries.length) return null;
  return (
    <div
      ref={focusRef}
      tabIndex={-1}
      role="alert"
      className="mb-5 rounded-lg border border-danger-600/30 bg-danger-50 p-4 text-sm text-danger-700"
    >
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {entries.map(([name, err]) => (
          <li key={name}>
            <a href={`#field-${name}`} className="underline underline-offset-2">
              {labels[name] || name}
            </a>
            : {text(err.message)}
          </li>
        ))}
      </ul>
    </div>
  );
}
