"use client";

import { useEffect, useMemo, useState } from "react";
import { type CatalogItem } from "@/lib/api";
import { filterFeaturedCatalog } from "@/lib/filter-featured";
import { MovieGrid } from "@/components/movie-card";

export function FeaturedMovieGrid({ items }: { items: CatalogItem[] }) {
  const [filtered, setFiltered] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const itemKey = useMemo(
    () => items.map((item) => `${item.mediaType}-${item.id}`).join(","),
    [items],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const next = await filterFeaturedCatalog(items);
        if (!cancelled) setFiltered(next);
      } catch {
        if (!cancelled) setFiltered([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [itemKey, items]);

  if (loading) {
    return <p className="py-8 text-sm text-muted">Loading available titles…</p>;
  }

  return <MovieGrid items={filtered} />;
}
