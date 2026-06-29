"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { detectRegion } from "@/lib/detect-region";
import { FEATURED_PLATFORMS_LABEL } from "@/lib/streaming-platforms";

export function FeaturedDetailGate({
  mediaType,
  tmdbId,
  children,
}: {
  mediaType: "movie" | "tv";
  tmdbId: number;
  children: React.ReactNode;
}) {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const region = await detectRegion();
        const watch = await api.watchProviders(mediaType, tmdbId, region);
        if (!cancelled) setAvailable(watch.providers.length > 0);
      } catch {
        if (!cancelled) setAvailable(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mediaType, tmdbId]);

  if (available === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted sm:px-6 lg:px-8">
        Checking streaming availability…
      </div>
    );
  }

  if (!available) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl font-black">Not available here</h1>
        <p className="mt-3 text-muted">
          This title isn&apos;t on {FEATURED_PLATFORMS_LABEL} in your region, so it
          isn&apos;t shown in Quvi.
        </p>
        <Link href="/" className="mt-8 inline-block text-gold hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
