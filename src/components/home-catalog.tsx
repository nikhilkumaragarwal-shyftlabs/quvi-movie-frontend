"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { api, type CatalogItem } from "@/lib/api";
import { filterFeaturedCatalog } from "@/lib/filter-featured";
import { MovieGrid, SectionTitle } from "@/components/movie-card";

export function HomeCatalog({ afterHero }: { afterHero?: ReactNode }) {
  const [hero, setHero] = useState<CatalogItem | null>(null);
  const [trending, setTrending] = useState<CatalogItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<CatalogItem[]>([]);
  const [popularTv, setPopularTv] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [trendingRaw, popularMoviesRaw, popularTvRaw] = await Promise.all([
          api.trending("all"),
          api.popular("movie"),
          api.popular("tv"),
        ]);

        const [trendingFiltered, popularMoviesFiltered, popularTvFiltered] =
          await Promise.all([
            filterFeaturedCatalog(trendingRaw),
            filterFeaturedCatalog(popularMoviesRaw),
            filterFeaturedCatalog(popularTvRaw),
          ]);

        if (cancelled) return;

        setTrending(trendingFiltered.slice(0, 12));
        setPopularMovies(popularMoviesFiltered.slice(0, 12));
        setPopularTv(popularTvFiltered.slice(0, 12));
        setHero(trendingFiltered[0] ?? null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load catalog");
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
      <div className="py-16 text-center text-sm text-muted">
        Loading titles on Netflix, HBO Max, Apple TV+, Hulu, and Peacock…
      </div>
    );
  }

  return (
    <>
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
      </div>
    </>
  );
}
