"use client";

import { useEffect, useMemo, useState } from "react";
import { type CatalogItem } from "@/lib/api";
import { filterFeaturedCatalog } from "@/lib/filter-featured";
import { MovieGrid } from "@/components/movie-card";

export function SearchResults({ results, query }: { results: CatalogItem[]; query: string }) {
  const [filtered, setFiltered] = useState<CatalogItem[] | null>(null);
  const itemKey = useMemo(
    () => results.map((item) => `${item.mediaType}-${item.id}`).join(","),
    [results],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setFiltered(null);
      const next = await filterFeaturedCatalog(results);
      if (!cancelled) setFiltered(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [itemKey, results]);

  return (
    <>
      <p className="mb-6 text-sm text-muted">
        {filtered === null
          ? `Searching for “${query}”…`
          : `${filtered.length} result${filtered.length === 1 ? "" : "s"} for “${query}” on Netflix, HBO Max, Apple TV+, Hulu, or Peacock`}
      </p>
      {filtered === null ? (
        <p className="py-8 text-sm text-muted">Loading available titles…</p>
      ) : (
        <MovieGrid items={filtered} />
      )}
    </>
  );
}
