"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export function TrailerButton({
  mediaType,
  tmdbId,
  title,
}: {
  mediaType: "movie" | "tv";
  tmdbId: number;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [trailerName, setTrailerName] = useState<string | null>(null);
  const [error, setError] = useState("");

  const close = useCallback(() => {
    setOpen(false);
    setEmbedUrl(null);
    setTrailerName(null);
    setError("");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const play = async () => {
    setLoading(true);
    setError("");
    try {
      const trailer = await api.trailer(mediaType, tmdbId);
      if (!trailer?.embedUrl) {
        setError("No trailer available for this title.");
        return;
      }
      setEmbedUrl(trailer.embedUrl);
      setTrailerName(trailer.name);
      setOpen(true);
    } catch {
      setError("Could not load trailer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={play}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium transition hover:border-accent disabled:opacity-60"
      >
        <PlayIcon />
        {loading ? "Loading…" : "Watch trailer"}
      </button>

      {error && !open && (
        <p className="w-full text-sm text-muted">{error}</p>
      )}

      {open && embedUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Trailer for ${title}`}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Trailer
                </p>
                <p className="font-display text-lg font-bold text-foreground">
                  {title}
                </p>
                {trailerName && (
                  <p className="text-sm text-muted">{trailerName}</p>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-border">
              <iframe
                src={embedUrl}
                title={`${title} trailer`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-accent"
      aria-hidden
    >
      <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11.04-7.36a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}
