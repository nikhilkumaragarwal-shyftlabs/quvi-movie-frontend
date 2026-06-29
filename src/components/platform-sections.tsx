"use client";

import { useEffect, useState } from "react";
import { api, type CatalogItem, type StreamingPlatform } from "@/lib/api";
import { detectRegion } from "@/lib/detect-region";
import { MovieGrid, SectionTitle } from "@/components/movie-card";

type PlatformCatalog = {
  movies: CatalogItem[];
  tv: CatalogItem[];
};

export function PlatformSections() {
  const [platforms, setPlatforms] = useState<StreamingPlatform[]>([]);
  const [catalog, setCatalog] = useState<Record<string, PlatformCatalog>>({});
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [detectedRegion, platformList] = await Promise.all([
          detectRegion(),
          api.platforms(),
        ]);
        if (cancelled) return;

        setRegion(detectedRegion);
        setPlatforms(platformList);

        const entries = await Promise.all(
          platformList.map(async (platform) => {
            const [movies, tv] = await Promise.all([
              api.platformCatalog(platform.slug, "movie", detectedRegion),
              api.platformCatalog(platform.slug, "tv", detectedRegion),
            ]);
            return [platform.slug, { movies, tv }] as const;
          }),
        );

        if (!cancelled) {
          setCatalog(Object.fromEntries(entries));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load platforms");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section>
        <SectionTitle>On your streaming services</SectionTitle>
        <p className="text-sm text-muted">Loading Netflix, HBO Max, Apple TV+, Hulu, and Peacock…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <SectionTitle>On your streaming services</SectionTitle>
        <p className="text-sm text-red-400">{error}</p>
      </section>
    );
  }

  return (
    <section className="space-y-14">
      <div>
        <SectionTitle>On your streaming services</SectionTitle>
        <p className="-mt-4 mb-8 text-sm text-muted">
          Movies and TV available on that platform in the catalog region ({region}
          {platforms.some((p) => p.usCatalog) ? "; Hulu and Peacock use US catalogs" : ""}
          ) — exclusive to that service among Netflix, HBO Max, Apple TV+, Hulu, and
          Peacock.
        </p>
      </div>

      {platforms.map((platform) => {
        const data = catalog[platform.slug];
        if (!data) return null;

        return (
          <div key={platform.slug} className="space-y-8">
            <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              {platform.name}
            </h3>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                Movies
              </h4>
              <MovieGrid items={data.movies} />
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                TV shows
              </h4>
              <MovieGrid items={data.tv} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
