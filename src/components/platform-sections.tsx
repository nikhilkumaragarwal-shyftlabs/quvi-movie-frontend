"use client";

import { useEffect, useState } from "react";
import { api, type CatalogItem, type StreamingPlatform } from "@/lib/api";
import { detectRegion } from "@/lib/detect-region";
import { MovieGrid, SectionTitle } from "@/components/movie-card";

type PlatformCatalog = {
  movies: CatalogItem[];
  tv: CatalogItem[];
};

function PlatformSkeleton({ name }: { name: string }) {
  return (
    <div className="space-y-8">
      <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">{name}</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
    </div>
  );
}

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

        let allCatalog: Record<string, PlatformCatalog>;
        try {
          allCatalog = await api.allPlatformCatalogs(detectedRegion);
        } catch {
          const entries = await Promise.all(
            platformList.map(async (platform) => {
              const [movies, tv] = await Promise.all([
                api.platformCatalog(platform.slug, "movie", detectedRegion),
                api.platformCatalog(platform.slug, "tv", detectedRegion),
              ]);
              return [platform.slug, { movies, tv }] as const;
            }),
          );
          allCatalog = Object.fromEntries(entries);
        }

        if (!cancelled) {
          setCatalog(allCatalog);
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

  return (
    <section className="space-y-14">
      <div>
        <SectionTitle>On your streaming services</SectionTitle>
        <p className="-mt-4 mb-8 text-sm text-muted">
          {loading
            ? "Loading Netflix, HBO Max, Apple TV+, Hulu, and Peacock…"
            : `Movies and TV available on that platform in the catalog region (${region}${
                platforms.some((p) => p.usCatalog) ? "; Hulu and Peacock use US catalogs" : ""
              }) — exclusive to that service among Netflix, HBO Max, Apple TV+, Hulu, and Peacock.`}
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading &&
        (platforms.length > 0
          ? platforms
          : [
              { slug: "netflix", name: "Netflix" },
              { slug: "hbo", name: "HBO Max" },
              { slug: "apple-tv", name: "Apple TV+" },
              { slug: "hulu", name: "Hulu" },
              { slug: "peacock", name: "Peacock" },
            ]
        ).map((platform) => <PlatformSkeleton key={platform.slug} name={platform.name} />)}

      {!loading &&
        platforms.map((platform) => {
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
