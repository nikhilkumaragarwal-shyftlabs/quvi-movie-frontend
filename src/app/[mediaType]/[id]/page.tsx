import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { FeaturedDetailGate } from "@/components/featured-detail-gate";
import { WatchlistButton } from "@/components/watchlist-button";
import { StreamingSection } from "@/components/streaming-section";
import { RatingPanel, TitleViewTracker } from "@/components/rating-panel";
import { RecommendationFeedback } from "@/components/recommendation-feedback";
import { TrailerButton } from "@/components/trailer-button";

type Props = {
  params: Promise<{ mediaType: string; id: string }>;
};

export default async function DetailPage({ params }: Props) {
  const { mediaType, id } = await params;
  if (mediaType !== "movie" && mediaType !== "tv") notFound();

  const tmdbId = Number(id);
  if (Number.isNaN(tmdbId)) notFound();

  let item: Awaited<ReturnType<typeof api.details>>;
  try {
    item = await api.details(mediaType, tmdbId);
  } catch {
    notFound();
  }

  const year = item.releaseDate?.slice(0, 4) ?? "—";
  const runtime =
    item.runtimeMinutes != null
      ? item.mediaType === "movie"
        ? `${Math.floor(item.runtimeMinutes / 60)}h ${item.runtimeMinutes % 60}m`
        : `${item.runtimeMinutes}m/ep`
      : null;

  return (
    <FeaturedDetailGate mediaType={item.mediaType} tmdbId={item.id}>
    <div>
      <TitleViewTracker
        mediaType={item.mediaType}
        tmdbId={item.id}
        title={item.title}
        genres={item.genres}
      />
      <section className="relative min-h-[420px]">
        {item.backdropUrl && (
          <Image
            src={item.backdropUrl}
            alt=""
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/30" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
          <div className="relative mx-auto aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-xl bg-elevated shadow-2xl ring-1 ring-border">
            {item.posterUrl ? (
              <Image
                src={item.posterUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="280px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">No poster</div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              {item.mediaType}
            </p>
            <h1 className="font-display mt-2 text-4xl font-black text-foreground sm:text-5xl">
              {item.title}
            </h1>
            {item.tagline && (
              <p className="mt-2 text-lg italic text-muted">{item.tagline}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
              <span>{year}</span>
              {runtime && <span>· {runtime}</span>}
              <span>· ★ {item.voteAverage.toFixed(1)}</span>
              {item.status && <span>· {item.status}</span>}
            </div>

            {item.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-6 max-w-3xl leading-relaxed text-foreground/90">{item.overview}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <TrailerButton
                mediaType={item.mediaType}
                tmdbId={item.id}
                title={item.title}
              />
              <WatchlistButton mediaType={item.mediaType} tmdbId={item.id} />
              {item.homepage && (
                <a
                  href={item.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-5 py-2.5 text-sm transition hover:border-accent"
                >
                  Official site
                </a>
              )}
            </div>

            <StreamingSection mediaType={item.mediaType} tmdbId={item.id} />

            <RecommendationFeedback
              mediaType={item.mediaType}
              tmdbId={item.id}
              title={item.title}
              genres={item.genres}
              variant="expanded"
            />

            <RatingPanel
              mediaType={item.mediaType}
              tmdbId={item.id}
              title={item.title}
              genres={item.genres}
            />

            {item.cast.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-xl font-bold">Cast</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {item.cast.map((c) => (
                    <li key={c.name + c.character} className="text-sm">
                      <span className="text-foreground">{c.name}</span>
                      <span className="text-muted"> as {c.character}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <p className="pb-10 text-center text-sm text-muted">
        <Link href="/" className="text-gold hover:underline">
          ← Back to browse
        </Link>
      </p>
    </div>
    </FeaturedDetailGate>
  );
}
