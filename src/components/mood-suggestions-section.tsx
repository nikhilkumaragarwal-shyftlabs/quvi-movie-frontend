"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { MoodPicker } from "@/components/mood-picker";
import { api } from "@/lib/api";
import { filterFeaturedCatalog } from "@/lib/filter-featured";
import {
  loadMoodPreferences,
  saveMoodPreferences,
  type MoodPreferences,
} from "@/lib/mood-options";
import { MovieGrid, SectionTitle } from "@/components/movie-card";

const SUGGESTION_LIMIT = 10;

export function MoodSuggestionsSection() {
  const { token, loading: authLoading } = useAuth();
  const [items, setItems] = useState<
    Awaited<ReturnType<typeof api.moodSuggestions>>["items"]
  >([]);
  const [fetching, setFetching] = useState(false);
  const [prefs, setPrefs] = useState<MoodPreferences>({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [appliedLabel, setAppliedLabel] = useState("");

  useEffect(() => {
    setPrefs(loadMoodPreferences());
  }, []);

  const load = useCallback(
    async (moodPrefs: MoodPreferences) => {
      if (!token) return;
      setFetching(true);
      try {
        const data = await api.moodSuggestions(token, moodPrefs, SUGGESTION_LIMIT);
        const filtered = await filterFeaturedCatalog(data.items);
        setItems(filtered.slice(0, SUGGESTION_LIMIT));
        setHasLoaded(true);

        const parts: string[] = [];
        if (data.applied?.mood) {
          parts.push(data.applied.mood.replace(/_/g, " "));
        }
        if (data.applied?.experience) {
          parts.push(data.applied.experience.replace(/_/g, " "));
        }
        setAppliedLabel(parts.length ? parts.join(" · ") : "");
      } finally {
        setFetching(false);
      }
    },
    [token],
  );

  const onApply = () => {
    saveMoodPreferences(prefs);
    load(prefs);
  };

  if (authLoading) return null;

  if (!token) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionTitle>What Can I Watch?</SectionTitle>
        <p className="text-sm text-muted">
          <Link href="/login" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to tell us your mood and get top 10 watch suggestions.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <SectionTitle>What Can I Watch?</SectionTitle>
        <p className="text-sm text-muted">
          Not sure what to put on? Pick a mood and watch type — we&apos;ll surface the
          top {SUGGESTION_LIMIT} titles from our catalog that fit, not just your personal
          recommendations.
        </p>
      </div>

      <MoodPicker
        token={token}
        value={prefs}
        onChange={setPrefs}
        onApply={onApply}
        pending={fetching}
      />

      {hasLoaded && (
        <>
          {appliedLabel && (
            <p className="text-sm text-gold capitalize">
              Top {SUGGESTION_LIMIT} for: {appliedLabel}
            </p>
          )}
          {items.length > 0 ? (
            <MovieGrid items={items} showFeedback onFeedbackUpdated={() => load(prefs)} />
          ) : (
            <p className="text-sm text-muted">
              No matches on your streaming services — try a different mood or experience.
            </p>
          )}
        </>
      )}
    </section>
  );
}
