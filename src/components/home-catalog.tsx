"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { api, type CatalogItem } from "@/lib/api";
import { detectRegion } from "@/lib/detect-region";
import { filterFeaturedCatalog } from "@/lib/filter-featured";
import { MovieGrid, SectionTitle } from "@/components/movie-card";

function HeroSkeleton() {
  return (
    <section className="relative h-[50vh] min-h-[320px] w-full animate-pulse bg-surface" />
  );
}

function GridSkeleton({ title }: { title: string }) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
    </section>
  );
}

export function HomeCatalog({ afterHero }: { afterHero?: ReactNode }) {
  const [hero, setHero] = useState<CatalogItem | null>(null);
  const [trending, setTrending] = useState<CatalogItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<CatalogItem[]>([]);
  const [popularTv, setPopularTv] = useState<CatalogItem[]>([]);
  const [heroReady, setHeroReady] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const region = await detectRegion();
        const trendingRaw = await api.trending("all");

        const trendingFiltered = await filterFeaturedCatalog(trendingRaw, region, 12);
        if (cancelled) return;

        setTrending(trendingFiltered);
        setHero(trendingFiltered[0] ?? null);
        setHeroReady(true);

        const [popularMoviesRaw, popularTvRaw] = await Promise.all([
          api.popular("movie"),
          api.popular("tv"),
        ]);

        const [popularMoviesFiltered, popularTvFiltered] = await Promise.all([
          filterFeaturedCatalog(popularMoviesRaw, region, 12),
          filterFeaturedCatalog(popularTvRaw, region, 12),
        ]);

        if (cancelled) return;

        setPopularMovies(popularMoviesFiltered);
        setPopularTv(popularTvFiltered);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load catalog");
        }
      } finally {
        if (!cancelled) setCatalogReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {!heroReady && <HeroSkeleton />}

      {hero?.backdropUrl && (
        <section className="relative h-[50vh] min-h-[320px] w-full overflow-hidden">
          <Image
            src={hero.backdropUrl}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-12 sm:px-6 lg:px-8">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              Trending this week
            </p>
            <h1 className="font-display mt-2 max-w-2xl text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-4 max-w-xl line-clamp-3 text-muted">{hero.overview}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${hero.mediaType}/${hero.id}`}
                className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                View details
              </Link>
              <Link
                href="/search"
                className="rounded-lg border border-border bg-surface/80 px-6 py-3 text-sm font-medium backdrop-blur transition hover:border-accent"
              >
                Explore catalog
              </Link>
            </div>
          </div>
        </section>
      )}

      {afterHero}

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-red-300">
            {error}. Make sure the API is running and TMDB_API_KEY is set.
          </div>
        )}

        {!catalogReady ? (
          <>
            <GridSkeleton title="Trending" />
            <GridSkeleton title="Popular movies" />
            <GridSkeleton title="Popular TV" />
          </>
        ) : (
          <>
            <section>
              <SectionTitle>Trending</SectionTitle>
              <MovieGrid items={trending} />
            </section>

            <section>
              <SectionTitle>Popular movies</SectionTitle>
              <MovieGrid items={popularMovies} />
            </section>

            <section>
              <SectionTitle>Popular TV</SectionTitle>
              <MovieGrid items={popularTv} />
            </section>
          </>
        )}
      </div>
    </>
  );
}
