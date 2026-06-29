"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { filterFeaturedCatalog } from "@/lib/filter-featured";
import { MovieGrid, SectionTitle } from "@/components/movie-card";

export function RecommendationsSection() {
  const { token, loading: authLoading } = useAuth();
  const [items, setItems] = useState<
    Awaited<ReturnType<typeof api.recommendations>>["items"]
  >([]);
  const [ratedCount, setRatedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    const data = await api.recommendations(token);
    const filtered = await filterFeaturedCatalog(data.items);
    setItems(filtered);
    setRatedCount(data.ratedCount);
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }
    load().finally(() => setLoading(false));
  }, [token, authLoading, load]);

  if (authLoading || loading) return null;

  if (!token) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionTitle>Movies Recommended for You</SectionTitle>
        <p className="text-sm text-muted">
          <Link href="/login" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          and rate movies or give thumbs feedback to get personalized picks.
        </p>
      </section>
    );
  }

  if (items.length === 0 && ratedCount === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-surface p-6">
        <SectionTitle>Movies Recommended for You</SectionTitle>
        <p className="text-sm text-muted">
          Rate titles you&apos;ve watched or use thumbs up/down on recommendations —
          we&apos;ll learn your taste and suggest better picks.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <SectionTitle>Movies Recommended for You</SectionTitle>
        <p className="text-sm text-muted">
          Based on your ratings and feedback · hover a poster to thumbs up or down
        </p>
      </div>

      {items.length > 0 ? (
        <MovieGrid items={items} showFeedback onFeedbackUpdated={load} />
      ) : (
        <p className="text-sm text-muted">
          Rate more titles or give feedback to improve recommendations.
        </p>
      )}
    </section>
  );
}
