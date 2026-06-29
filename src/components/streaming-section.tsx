"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api, type WatchAvailability } from "@/lib/api";
import { detectRegion } from "@/lib/detect-region";
import { FEATURED_PLATFORMS_LABEL } from "@/lib/streaming-platforms";

export function StreamingSection({
  mediaType,
  tmdbId,
}: {
  mediaType: "movie" | "tv";
  tmdbId: number;
}) {
  const [watch, setWatch] = useState<WatchAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const region = await detectRegion();
        const data = await api.watchProviders(mediaType, tmdbId, region);
        if (!cancelled) setWatch(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load availability");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mediaType, tmdbId]);

  if (loading) {
    return (
      <section className="mt-10 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-display text-xl font-bold">Where to stream</h2>
        <p className="mt-2 text-sm text-muted">Detecting your location…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-10 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-display text-xl font-bold">Where to stream</h2>
        <p className="mt-2 text-sm text-red-400">{error}</p>
      </section>
    );
  }

  if (!watch) return null;

  return (
    <section className="mt-10 rounded-xl border border-border bg-surface p-6">
      <h2 className="font-display text-xl font-bold">Where to stream</h2>
      <p className="mt-1 text-sm text-muted">
        In your region ({watch.region})
      </p>

      {watch.providers.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Not on {FEATURED_PLATFORMS_LABEL} in your region.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {watch.providers.map((p) => (
            <li key={p.providerId}>
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border bg-elevated p-3 transition hover:border-accent hover:bg-surface"
              >
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-background">
                  {p.logoUrl ? (
                    <Image
                      src={p.logoUrl}
                      alt={p.name}
                      fill
                      className="object-contain p-1"
                      sizes="40px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-muted">
                      {p.name.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{p.name}</p>
                </div>
                <span className="flex-shrink-0 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white">
                  Watch
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-muted">
        Data by{" "}
        <a
          href="https://www.justwatch.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          JustWatch
        </a>
      </p>
    </section>
  );
}
