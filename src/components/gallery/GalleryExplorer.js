"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, Play } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { parseVideo, youtubeThumbnail } from "@/lib/utils/video";
import { pick } from "@/lib/utils/localize";
import { cn } from "@/lib/utils/cn";

// The lightbox is only downloaded when someone opens a photo.
const Lightbox = dynamic(() => import("@/components/gallery/Lightbox"), { ssr: false });

function VideoTile({ item, title, labels }) {
  const [playing, setPlaying] = useState(false);
  const video = parseVideo(item.url);
  if (!video) return null;

  const poster = item.thumbnailUrl || (video.kind === "youtube" ? youtubeThumbnail(video.id) : "/placeholders/gallery.svg");

  if (video.kind === "link") {
    return (
      <a
        href={video.href}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-primary-900 text-white"
      >
        <SmartImage src={poster} alt="" fill sizes="(min-width: 1024px) 352px, 50vw" className="object-cover opacity-60" />
        <span className="relative inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-primary">
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> {labels.video}
        </span>
      </a>
    );
  }

  // No autoplay on page load: the video loads only after a click/tap (important on mobile data).
  if (playing) {
    return video.kind === "youtube" ? (
      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-black">
        <iframe
          src={video.embedUrl}
          title={title}
          className="h-full w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    ) : (
      <video src={video.src} controls autoPlay preload="none" className="aspect-[4/3] w-full rounded-lg bg-black" aria-label={title} />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={labels.play}
      className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-primary-900"
    >
      <SmartImage src={poster} alt="" fill sizes="(min-width: 1024px) 352px, 50vw" className="object-cover transition-transform group-hover:scale-105" />
      <span className="absolute inset-0 flex items-center justify-center bg-primary-950/30">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg">
          <Play className="ml-0.5 h-6 w-6" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}

export function GalleryExplorer({ items }) {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const [category, setCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const categories = useMemo(() => {
    const present = [...new Set(items.map((i) => i.category).filter(Boolean))];
    return ["all", ...present];
  }, [items]);

  const visible = useMemo(() => (category === "all" ? items : items.filter((i) => i.category === category)), [items, category]);
  const images = useMemo(() => visible.filter((i) => i.type !== "video"), [visible]);

  const categoryLabel = (key) => (key === "all" ? t("all") : t.has(key) ? t(key) : key);

  return (
    <div>
      {categories.length > 2 ? (
        <div role="tablist" aria-label={t("heading")} className="mb-6 flex flex-wrap gap-2">
          {categories.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={category === key}
              onClick={() => setCategory(key)}
              className={cn(
                "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors",
                category === key ? "border-primary bg-primary text-white" : "border-line bg-white text-primary hover:bg-primary-50"
              )}
            >
              {categoryLabel(key)}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {visible.map((item, i) => {
          const title = pick(item.title, locale);
          const isVideo = item.type === "video";
          const imageIndex = images.findIndex((x) => x.id === item.id);
          return (
            <li key={item.id}>
              {isVideo ? (
                <VideoTile item={item} title={title} labels={{ play: t("playVideo", { title }), video: t("video") }} />
              ) : (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(imageIndex)}
                  aria-label={t("openImage", { title })}
                  className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface"
                >
                  <SmartImage
                    src={item.url}
                    alt={pick(item.alt, locale) || title}
                    fill
                    priority={i < 2}
                    sizes="(min-width: 1024px) 352px, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              )}
              {title ? <p className="mt-1.5 truncate text-sm text-muted">{title}</p> : null}
            </li>
          );
        })}
      </ul>

      {lightboxIndex !== null && images.length ? (
        <Lightbox
          items={images}
          index={Math.min(lightboxIndex, images.length - 1)}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </div>
  );
}
