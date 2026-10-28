"use client";

import { useEffect, useRef } from "react";
import { env } from "@/config/environment";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Optional Cloudflare Turnstile hook. Renders nothing unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.
 * The token is passed to onToken and must be verified by the BACKEND (the secret key never touches the frontend).
 */
export function TurnstileWidget({ onToken }) {
  const ref = useRef(null);
  const widgetId = useRef(null);
  const siteKey = env.turnstileSiteKey;

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !window.turnstile || widgetId.current !== null) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };

    if (window.turnstile) render();
    else {
      let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
    }

    return () => {
      cancelled = true;
      if (widgetId.current !== null && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return <div ref={ref} className="min-h-[65px]" />;
}
