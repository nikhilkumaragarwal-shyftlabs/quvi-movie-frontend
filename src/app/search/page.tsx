import Link from "next/link";
import { api } from "@/lib/api";
import { SearchResults } from "@/components/search-results";
import { SectionTitle } from "@/components/movie-card";

type Props = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", type = "multi" } = await searchParams;
  const mediaType = type === "movie" || type === "tv" ? type : "multi";

  let results: Awaited<ReturnType<typeof api.search>> = [];
  let error: string | null = null;

  if (q.trim().length >= 2) {
    try {
      results = await api.search(q.trim(), mediaType);
    } catch (e) {
      error = e instanceof Error ? e.message : "Search failed";
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionTitle>Search</SectionTitle>

      <form className="mb-8 flex flex-col gap-3 sm:flex-row" action="/search" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search movies and TV…"
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-accent"
        />
        <select
          name="type"
          defaultValue={mediaType}
          className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none"
        >
          <option value="multi">All</option>
          <option value="movie">Movies</option>
          <option value="tv">TV</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover"
        >
          Search
        </button>
      </form>

      {error && <p className="mb-6 text-red-400">{error}</p>}

      {q.trim().length < 2 ? (
        <p className="text-muted">Enter at least 2 characters to search.</p>
      ) : (
        <SearchResults results={results} query={q.trim()} />
      )}

      <p className="mt-10 text-center text-sm text-muted">
        <Link href="/" className="text-gold hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
