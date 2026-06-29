"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export function WatchlistButton({
  mediaType,
  tmdbId,
}: {
  mediaType: "movie" | "tv";
  tmdbId: number;
}) {
  const { token } = useAuth();
  const router = useRouter();
  const [onList, setOnList] = useState(false);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setPending(true);
    try {
      const res = await api.toggleWatchlist(token, mediaType, tmdbId);
      setOnList(res.onWatchlist);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium transition hover:border-accent disabled:opacity-60"
    >
      {pending ? "Saving…" : onList ? "On watchlist ✓" : "Add to watchlist"}
    </button>
  );
}
