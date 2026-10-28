// Safe handling of gallery video links. Only http(s) URLs are ever used (never javascript:/data:).

function parseUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** @returns {{ kind: "youtube", embedUrl: string, id: string } | { kind: "file", src: string } | { kind: "link", href: string } | null} */
export function parseVideo(value) {
  const url = value ? parseUrl(value) : null;
  if (!url) return null;
  const host = url.hostname.replace(/^www\./, "");

  let id = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2];
  }
  if (id && /^[\w-]{6,20}$/.test(id)) {
    return { kind: "youtube", id, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` };
  }
  if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) return { kind: "file", src: url.toString() };
  return { kind: "link", href: url.toString() };
}

/** Thumbnail for a YouTube link when the admin did not upload a poster. */
export function youtubeThumbnail(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
