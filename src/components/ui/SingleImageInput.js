"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { SmartImage } from "@/components/ui/SmartImage";
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from "@/components/ui/ImageUploader";
import { uploadImage } from "@/lib/api/gallery.api";
import { getAdminErrorMessage } from "@/lib/api/errors";

/** One image URL field with upload + preview (offers, attractions, gallery items, CMS images). */
export function SingleImageInput({ label, value, onChange, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file) {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setBusy(true);
    try {
      const result = await uploadImage(file);
      onChange(result.url);
    } catch (err) {
      setError(getAdminErrorMessage(err));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-primary-900">{label}</span>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
          {value ? (
            <SmartImage src={value} alt="" fill sizes="128px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
          )}
          {busy ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Spinner label="Uploading" />
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            <ImagePlus className="h-4 w-4" aria-hidden="true" /> {value ? "Replace" : "Upload"}
          </Button>
          {value ? (
            <Button variant="ghost" size="sm" onClick={() => onChange("")} disabled={busy}>
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        aria-label={`${label}: choose a file`}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p role="alert" className="mt-1.5 text-sm font-medium text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
