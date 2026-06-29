"use client";

import { useEffect, useState } from "react";
import { api, type UserRating } from "@/lib/api";
import {
  EXPERIENCE_OPTIONS,
  MOOD_OPTIONS,
  type ExperienceSlug,
  type MoodPreferences,
  type MoodSlug,
} from "@/lib/mood-options";

export function MoodPicker({
  token,
  value,
  onChange,
  onApply,
  pending,
}: {
  token: string;
  value: MoodPreferences;
  onChange: (next: MoodPreferences) => void;
  onApply: () => void;
  pending?: boolean;
}) {
  const [ratings, setRatings] = useState<UserRating[]>([]);

  useEffect(() => {
    if (!token || value.experience !== "similar_liked") return;
    api.myRatings(token).then(setRatings).catch(() => setRatings([]));
  }, [token, value.experience]);

  const setMood = (mood: MoodSlug | undefined) => {
    onChange({ ...value, mood: value.mood === mood ? undefined : mood });
  };

  const setExperience = (experience: ExperienceSlug | undefined) => {
    onChange({
      ...value,
      experience: value.experience === experience ? undefined : experience,
      similarId: undefined,
      similarMediaType: undefined,
    });
  };

  const similarValue =
    value.similarId && value.similarMediaType
      ? `${value.similarMediaType}:${value.similarId}`
      : "";

  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-5">
      <div>
        <h3 className="font-display text-lg font-bold">What&apos;s your mood?</h3>
        <p className="mt-1 text-sm text-muted">
          Pick a vibe and the kind of watch you want — we&apos;ll tailor your picks.
        </p>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Mood
        </p>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.slug}
              type="button"
              onClick={() => setMood(m.slug)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                value.mood === m.slug
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-border bg-elevated text-foreground hover:border-gold/50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Experience
        </p>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_OPTIONS.map((e) => (
            <button
              key={e.slug}
              type="button"
              onClick={() => setExperience(e.slug)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                value.experience === e.slug
                  ? "border-accent bg-accent/15 text-foreground"
                  : "border-border bg-elevated text-foreground hover:border-accent/50"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {value.experience === "similar_liked" && (
        <label className="block">
          <span className="mb-2 block text-sm text-muted">
            Similar to a title you enjoyed
          </span>
          <select
            value={similarValue}
            onChange={(e) => {
              const raw = e.target.value;
              if (!raw) {
                onChange({ ...value, similarId: undefined, similarMediaType: undefined });
                return;
              }
              const [mediaType, id] = raw.split(":");
              onChange({
                ...value,
                similarMediaType: mediaType as "movie" | "tv",
                similarId: Number(id),
              });
            }}
            className="w-full rounded-lg border border-border bg-elevated px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="">Auto — use your top-rated title</option>
            {ratings.map((r) => (
              <option key={`${r.mediaType}-${r.tmdbId}`} value={`${r.mediaType}:${r.tmdbId}`}>
                {r.title} ({r.mediaType}) · ★ {r.score}
              </option>
            ))}
          </select>
        </label>
      )}

      <button
        type="button"
        onClick={onApply}
        disabled={pending || (!value.mood && !value.experience)}
        className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {pending ? "Finding suggestions…" : "Get suggestions"}
      </button>
    </div>
  );
}
