"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

type Sentiment = "up" | "down";

export function RecommendationFeedback({
  mediaType,
  tmdbId,
  title,
  genres = [],
  variant = "compact",
  onUpdated,
}: {
  mediaType: "movie" | "tv";
  tmdbId: number;
  title: string;
  genres?: string[];
  variant?: "compact" | "expanded";
  onUpdated?: () => void;
}) {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    const existing = await api.getFeedback(token, mediaType, tmdbId);
    if (existing) {
      setSentiment(existing.sentiment);
      setComment(existing.comment ?? "");
    }
  }, [token, mediaType, tmdbId]);

  useEffect(() => {
    if (authLoading || !token) return;
    load().catch(() => {});
  }, [authLoading, token, load]);

  const save = async (next: Sentiment, nextComment?: string) => {
    if (!token) {
      router.push("/login");
      return;
    }
    setPending(true);
    setMessage("");
    try {
      const res = await api.submitFeedback(token, {
        tmdbId,
        mediaType,
        sentiment: next,
        title,
        genres,
        comment: nextComment ?? comment,
      });
      setSentiment(res.sentiment);
      setMessage("Thanks — we'll use this to improve your recommendations.");
      onUpdated?.();
    } catch {
      setMessage("Could not save feedback.");
    } finally {
      setPending(false);
    }
  };

  const onThumb = async (next: Sentiment) => {
    if (sentiment === next) {
      if (!token) return;
      setPending(true);
      try {
        await api.removeFeedback(token, mediaType, tmdbId);
        setSentiment(null);
        setComment("");
        setMessage("Feedback removed.");
        onUpdated?.();
      } finally {
        setPending(false);
      }
      return;
    }
    setSentiment(next);
    await save(next);
  };

  const onSaveComment = async () => {
    if (!sentiment) return;
    await save(sentiment, comment);
  };

  if (variant === "compact") {
    return (
      <div
        className="flex items-center gap-1.5"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <ThumbButton
          type="up"
          active={sentiment === "up"}
          disabled={pending}
          onClick={() => onThumb("up")}
        />
        <ThumbButton
          type="down"
          active={sentiment === "down"}
          disabled={pending}
          onClick={() => onThumb("down")}
        />
      </div>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-border bg-surface p-5">
      <h2 className="font-display text-lg font-bold">Recommendation feedback</h2>
      <p className="mt-1 text-sm text-muted">
        Help us learn what you want more (or less) of in your picks.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ThumbButton
          type="up"
          active={sentiment === "up"}
          disabled={pending}
          onClick={() => onThumb("up")}
          large
        />
        <ThumbButton
          type="down"
          active={sentiment === "down"}
          disabled={pending}
          onClick={() => onThumb("down")}
          large
        />
        {!token && (
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm text-gold hover:underline"
          >
            Sign in to give feedback
          </button>
        )}
      </div>

      {token && (
        <>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm text-muted">
              Optional comment — why did you like or dislike this?
            </span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. Love sci-fi like this, or too slow for my taste…"
              className="w-full resize-none rounded-lg border border-border bg-elevated px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
          {sentiment && (
            <button
              type="button"
              onClick={onSaveComment}
              disabled={pending}
              className="mt-3 rounded-lg border border-border px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-foreground disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save comment"}
            </button>
          )}
        </>
      )}

      {message && <p className="mt-3 text-sm text-muted">{message}</p>}
    </section>
  );
}

function ThumbButton({
  type,
  active,
  disabled,
  onClick,
  large,
}: {
  type: Sentiment;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  large?: boolean;
}) {
  const isUp = type === "up";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={isUp ? "Thumbs up" : "Thumbs down"}
      className={`flex items-center justify-center rounded-lg border transition disabled:opacity-50 ${
        large ? "h-11 w-11" : "h-8 w-8"
      } ${
        active
          ? isUp
            ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-400"
            : "border-red-500/60 bg-red-500/20 text-red-400"
          : "border-border bg-background/80 text-muted backdrop-blur hover:border-gold hover:text-gold"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={large ? "h-5 w-5" : "h-4 w-4"}
        aria-hidden
      >
        {isUp ? (
          <path d="M7 22V11l3-9 4 4v2h7l-2 9H7zm2-11l-2 6h9l1.4-5H12V9l-2-2z" />
        ) : (
          <path d="M17 2v11l-3 9-4-4V6H3l2-9h12zm-2 11 2-6H8.6L7 12h8v1z" />
        )}
      </svg>
    </button>
  );
}
