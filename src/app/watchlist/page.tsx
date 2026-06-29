"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { api, type CatalogDetail } from "@/lib/api";
import { filterFeaturedCatalog } from "@/lib/filter-featured";
import { MovieGrid, SectionTitle } from "@/components/movie-card";

export default function WatchlistPage() {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<(CatalogDetail & { addedAt: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    api
      .watchlist(token)
      .then((list) => filterFeaturedCatalog(list))
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load watchlist"))
      .finally(() => setLoading(false));
  }, [token, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted sm:px-6 lg:px-8">
        Loading watchlist…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionTitle>Your watchlist</SectionTitle>
      {error && <p className="mb-6 text-red-400">{error}</p>}
      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted">Nothing saved yet.</p>
          <Link href="/" className="mt-4 inline-block text-gold hover:underline">
            Browse trending titles
          </Link>
        </div>
      ) : (
        <MovieGrid items={items} />
      )}
    </div>
  );
}
