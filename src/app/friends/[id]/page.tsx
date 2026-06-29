"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { SectionTitle } from "@/components/movie-card";
import { ApiError, api, type FriendProfile } from "@/lib/api";

function displayName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export default function FriendProfilePage() {
  const params = useParams<{ id: string }>();
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login");
      return;
    }

    api
      .friendProfile(token, params.id)
      .then(setProfile)
      .catch((e) => {
        setError(e instanceof ApiError ? e.message : "Could not load friend");
      })
      .finally(() => setLoading(false));
  }, [authLoading, token, params.id, router]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted sm:px-6">
        Loading profile…
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-red-400">{error || "Friend not found"}</p>
        <Link href="/friends" className="mt-6 inline-block text-gold hover:underline">
          ← Back to friends
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/friends" className="text-sm text-gold hover:underline">
        ← Friends
      </Link>
      <SectionTitle>{displayName(profile.user)}</SectionTitle>
      <p className="-mt-4 mb-8 text-sm text-muted">What they watch and rate</p>

      {profile.taste.length > 0 && (
        <section className="mb-10 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Favorite genres
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.taste.slice(0, 8).map((t) => (
              <span
                key={t.genre}
                className="rounded-full border border-border bg-elevated px-3 py-1 text-xs text-foreground"
              >
                {t.genre}
                <span className="ml-1 text-gold">×{t.count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {profile.recentRatings.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Recently rated
          </h2>
          <ul className="space-y-2">
            {profile.recentRatings.map((r) => (
              <li key={`${r.mediaType}-${r.tmdbId}`}>
                <Link
                  href={`/${r.mediaType}/${r.tmdbId}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-accent"
                >
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted">
                      {r.mediaType.toUpperCase()} · {r.genres.slice(0, 3).join(", ")}
                    </p>
                  </div>
                  <span className="text-sm text-gold">★ {r.score.toFixed(1)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.recentViews.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Recently viewed
          </h2>
          <ul className="space-y-2">
            {profile.recentViews.map((v) => (
              <li key={`${v.mediaType}-${v.tmdbId}-${v.viewedAt}`}>
                <Link
                  href={`/${v.mediaType}/${v.tmdbId}`}
                  className="block rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-accent"
                >
                  <p className="font-medium">{v.title}</p>
                  <p className="text-xs text-muted">
                    {v.mediaType.toUpperCase()} · {v.genres.slice(0, 3).join(", ")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.taste.length === 0 &&
        profile.recentRatings.length === 0 &&
        profile.recentViews.length === 0 && (
          <p className="text-sm text-muted">No watch activity yet.</p>
        )}
    </div>
  );
}
