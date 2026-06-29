"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import type { CatalogItem } from "@/lib/api";
import { RecommendationFeedback } from "@/components/recommendation-feedback";

export function MovieCard({
  item,
  genres,
  showFeedback = false,
  onFeedbackUpdated,
}: {
  item: CatalogItem;
  genres?: string[];
  showFeedback?: boolean;
  onFeedbackUpdated?: () => void;
}) {
  const { token, loading: authLoading } = useAuth();
  const year = item.releaseDate?.slice(0, 4) ?? "—";
  const feedbackGenres =
    genres ??
    item.genres ??
    ("matchedGenres" in item
      ? (item as CatalogItem & { matchedGenres?: string[] }).matchedGenres
      : undefined) ??
    [];
  const feedbackEnabled = showFeedback || (!authLoading && !!token);

  return (
    <article className="group animate-fade-in">
      <div className="relative">
        <Link href={`/${item.mediaType}/${item.id}`} className="block">
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-elevated shadow-lg ring-1 ring-border transition group-hover:ring-accent/60">
            {item.posterUrl ? (
              <Image
                src={item.posterUrl}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted">
                No poster
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-12 opacity-0 transition group-hover:opacity-100">
              <p className="line-clamp-2 text-sm font-medium text-white">{item.overview}</p>
            </div>
          </div>
        </Link>

        {feedbackEnabled && (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
            <div className="rounded-lg bg-background/90 p-1.5 shadow-lg ring-1 ring-border backdrop-blur">
              <RecommendationFeedback
                mediaType={item.mediaType}
                tmdbId={item.id}
                title={item.title}
                genres={feedbackGenres}
                variant="compact"
                onUpdated={onFeedbackUpdated}
              />
            </div>
          </div>
        )}
      </div>

      <Link href={`/${item.mediaType}/${item.id}`} className="mt-3 block">
        <h3 className="font-display line-clamp-1 text-base font-bold text-foreground group-hover:text-gold">
          {item.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          <span>{year}</span>
          <span>·</span>
          <span className="uppercase">{item.mediaType}</span>
          <span>·</span>
          <span className="text-gold">★ {item.voteAverage.toFixed(1)}</span>
        </div>
      </Link>
    </article>
  );
}

export function MovieGrid({
  items,
  showFeedback = false,
  onFeedbackUpdated,
}: {
  items: CatalogItem[];
  showFeedback?: boolean;
  onFeedbackUpdated?: () => void;
}) {
  if (items.length === 0) {
    return <p className="py-16 text-center text-muted">No titles found.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <MovieCard
          key={`${item.mediaType}-${item.id}`}
          item={item}
          showFeedback={showFeedback}
          onFeedbackUpdated={onFeedbackUpdated}
        />
      ))}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
      {children}
    </h2>
  );
}
