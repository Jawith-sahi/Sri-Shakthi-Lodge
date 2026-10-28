"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils/cn";
import { getAdminErrorMessage } from "@/lib/api/errors";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB (UI check only - the backend must re-validate)

export function validateImageFile(file) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}" is not a JPG, PNG or WebP image.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `"${file.name}" is larger than ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`;
  }
  return null;
}

/**
 * Multi-image manager (room photos).
 *  - validates type/size, shows previews and a per-file upload state, uploads one by one
 *  - existing images can be re-ordered (←/→ buttons: keyboard friendly) and deleted
 *
 * images: [{ id, url, alt }]
 * onUpload(file) -> Promise<image>;  onDelete(image) -> Promise;  onReorder(imageIds) -> Promise
 */
export function ImageUploader({ images = [], onUpload, onDelete, onReorder, onChange, disabled = false, label = "Photos" }) {
  const inputRef = useRef(null);
  const [queue, setQueue] = useState([]); // [{ key, name, preview, state: "uploading" | "error", error? }]
  const [busyId, setBusyId] = useState(null);

  const patchQueue = (key, patch) => setQueue((q) => q.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const valid = [];
    for (const file of files) {
      const problem = validateImageFile(file);
      if (problem) toast.error(problem);
      else valid.push(file);
    }

    let latest = images;
    for (const file of valid) {
      const key = `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`;
      const preview = URL.createObjectURL(file);
      setQueue((q) => [...q, { key, name: file.name, preview, state: "uploading" }]);
      try {
        const saved = await onUpload(file);
        latest = [...latest, saved];
        onChange?.(latest);
        setQueue((q) => q.filter((item) => item.key !== key));
        URL.revokeObjectURL(preview);
      } catch (error) {
        patchQueue(key, { state: "error", error: getAdminErrorMessage(error) });
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function move(index, delta) {
    const next = [...images];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange?.(next);
    try {
      await onReorder?.(next.map((i) => i.id));
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
      onChange?.(images);
    }
  }

  async function remove(image) {
    setBusyId(image.id);
    try {
      await onDelete?.(image);
      onChange?.(images.filter((i) => i.id !== image.id));
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-primary-900">{label}</span>
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled}>
          <ImagePlus className="h-4 w-4" aria-hidden="true" /> Add photos
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        aria-label="Choose photos to upload"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mb-3 text-xs text-muted">JPG, PNG or WebP · up to 5 MB each · first photo is the cover.</p>

      {images.length === 0 && queue.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          No photos yet. Add some so guests can see the room.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="relative aspect-[4/3] bg-surface">
                <SmartImage
                  src={image.url}
                  alt={typeof image.alt === "string" ? image.alt : image.alt?.en || ""}
                  fill
                  sizes="(min-width: 1024px) 200px, 45vw"
                  className="object-cover"
                />
                {index === 0 ? (
                  <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-semibold text-white">Cover</span>
                ) : null}
                {busyId === image.id ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <Spinner label="Working" />
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || disabled}
                    aria-label="Move photo earlier"
                    className="inline-flex h-9 w-9 items-center justify-center rounded text-primary hover:bg-primary-50 disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1 || disabled}
                    aria-label="Move photo later"
                    className="inline-flex h-9 w-9 items-center justify-center rounded text-primary hover:bg-primary-50 disabled:opacity-30"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(image)}
                  disabled={disabled || busyId === image.id}
                  aria-label="Delete photo"
                  className="inline-flex h-9 w-9 items-center justify-center rounded text-danger-600 hover:bg-danger-50 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}

          {queue.map((item) => (
            <li key={item.key} className={cn("overflow-hidden rounded-lg border bg-white", item.state === "error" ? "border-danger-600" : "border-line")}>
              <div className="relative aspect-[4/3] bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="h-full w-full object-cover opacity-70" />
                {item.state === "uploading" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/60 text-sm text-primary-900">
                    <Spinner label="Uploading" />
                    <span>Uploading…</span>
                  </div>
                ) : null}
              </div>
              {item.state === "error" ? (
                <div className="flex items-start justify-between gap-1 p-2 text-xs text-danger-700">
                  <span>{item.error}</span>
                  <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => {
                      URL.revokeObjectURL(item.preview);
                      setQueue((q) => q.filter((x) => x.key !== item.key));
                    }}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <p className="truncate p-2 text-xs text-muted">{item.name}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
