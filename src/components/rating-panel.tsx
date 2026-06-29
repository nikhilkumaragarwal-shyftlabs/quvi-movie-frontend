"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

export function TitleViewTracker({
  mediaType,
  tmdbId,
  title,
  genres,
}: {
  mediaType: "movie" | "tv";
  tmdbId: number;
  title: string;
  genres: string[];
}) {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    api.recordView(token, { tmdbId, mediaType, title, genres }).catch(() => {});
  }, [token, tmdbId, mediaType, title, genres]);

  return null;
}

export function RatingPanel({
  mediaType,
  tmdbId,
  title,
  genres,
}: {
  mediaType: "movie" | "tv";
  tmdbId: number;
  title: string;
  genres: string[];
}) {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [score, setScore] = useState(7);
  const [saved, setSaved] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getRating(token, mediaType, tmdbId)
      .then((r) => {
        if (r) {
          setSaved(r.score);
          setScore(r.score);
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, token, mediaType, tmdbId]);

  const submit = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setPending(true);
    setMessage("");
    try {
      const r = await api.rate(token, {
        tmdbId,
        mediaType,
        score,
        title,
        genres,
      });
      setSaved(r.score);
      setMessage("Rating saved — we'll use this with your feedback to improve recommendations.");
    } catch {
      setMessage("Could not save rating.");
    } finally {
      setPending(false);
    }
  };

  const remove = async () => {
    if (!token) return;
    setPending(true);
    try {
      await api.removeRating(token, mediaType, tmdbId);
      setSaved(null);
      setScore(7);
      setMessage("Rating removed.");
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return (
      <section className="mt-8 rounded-xl border border-border bg-surface p-5">
        <p className="text-sm text-muted">Loading your rating…</p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-border bg-surface p-5">
      <h2 className="font-display text-lg font-bold">Your rating</h2>
      <p className="mt-1 text-sm text-muted">
        Rate this title to build your genre taste profile.
      </p>

      <div className="mt-4 flex items-center gap-4">
        <input
          type="range"
          min={1}
          max={10}
          step={0.5}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="flex-1 accent-accent"
        />
        <span className="font-display w-12 text-right text-2xl font-black text-gold">
          {score.toFixed(1)}
        </span>
      </div>

      {genres.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          Genres: {genres.join(" · ")}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Saving…" : saved != null ? "Update rating" : "Save rating"}
        </button>
        {saved != null && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-accent"
          >
            Remove
          </button>
        )}
        {!token && (
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm text-gold hover:underline"
          >
            Sign in to rate
          </button>
        )}
      </div>

      {message && <p className="mt-3 text-sm text-muted">{message}</p>}
    </section>
  );
}
