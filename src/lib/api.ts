const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export type CatalogItem = {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  voteAverage: number;
  genreIds: number[];
  genres: string[];
};

export type CatalogDetail = CatalogItem & {
  genres: string[];
  runtimeMinutes: number | null;
  tagline: string;
  status: string;
  homepage: string | null;
  cast: { name: string; character: string }[];
};

export type StreamingPlatform = {
  slug: string;
  name: string;
  /** Catalog uses US availability (Hulu, Peacock). */
  usCatalog?: boolean;
};

export type WatchProvider = {
  providerId: number;
  name: string;
  logoUrl: string | null;
  link: string;
};

export type WatchAvailability = {
  region: string;
  providers: WatchProvider[];
};

export type FriendUser = {
  id: string;
  firstName: string;
  lastName: string;
};

export type FriendSummary = FriendUser & {
  topGenres: string[];
  ratedCount: number;
};

export type FriendRequest = {
  id: string;
  direction: "incoming" | "outgoing";
  status: "pending" | "accepted" | "rejected";
  user: FriendUser;
  createdAt: string;
};

export type FriendProfile = {
  user: FriendUser;
  taste: { genre: string; weight: number; count: number }[];
  recentRatings: {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    score: number;
    genres: string[];
    ratedAt: string;
  }[];
  recentViews: {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    genres: string[];
    viewedAt: string;
  }[];
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export type UserRating = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  score: number;
  title: string;
  genres: string[];
  ratedAt: string;
};

export type RecommendationsResponse = {
  items: (CatalogItem & {
    matchScore: number;
    matchedGenres: string[];
    genres: string[];
  })[];
  taste: { genre: string; weight: number; count: number }[];
  ratedCount: number;
  applied?: { mood?: string; experience?: string };
};

export type MoodSuggestionsResponse = {
  items: (CatalogItem & {
    matchScore: number;
    matchedGenres: string[];
    genres: string[];
  })[];
  applied?: { mood?: string; experience?: string };
};

export type ChatMoviesResponse = {
  reply: string;
  items: CatalogItem[];
};

export type RecommendationFeedback = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  sentiment: "up" | "down";
  comment: string | null;
  title: string;
  genres: string[];
  updatedAt: string;
};

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) return null as T;
  return JSON.parse(text) as T;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await parseJsonResponse<{ message?: string; error?: string }>(res);
      if (body && typeof body === "object") {
        message = body.message ?? body.error ?? message;
        if (Array.isArray(message)) message = message.join(", ");
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return parseJsonResponse<T>(res);
}

export const api = {
  health: () => request<{ status: string; database: string }>("/health"),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: (token: string) => request<User>("/users/me", {}, token),

  trending: (type: "movie" | "tv" | "all" = "all") =>
    request<CatalogItem[]>(`/movies/trending?type=${type}`),

  popular: (type: "movie" | "tv" = "movie") =>
    request<CatalogItem[]>(`/movies/popular?type=${type}`),

  platforms: () => request<StreamingPlatform[]>("/movies/platforms"),

  platformCatalog: (
    slug: string,
    type: "movie" | "tv",
    region: string,
  ) =>
    request<CatalogItem[]>(
      `/movies/platforms/${slug}?type=${type}&region=${encodeURIComponent(region)}`,
    ),

  allPlatformCatalogs: (region: string) =>
    request<Record<string, { movies: CatalogItem[]; tv: CatalogItem[] }>>(
      `/movies/platforms/all/catalog?region=${encodeURIComponent(region)}`,
    ),

  filterFeatured: (
    items: { id: number; mediaType: "movie" | "tv" }[],
    region: string,
    limit?: number,
  ) =>
    request<{ id: number; mediaType: "movie" | "tv" }[]>(
      "/movies/filter-featured",
      {
        method: "POST",
        body: JSON.stringify({ items, region, limit }),
      },
    ),

  search: (q: string, type: "movie" | "tv" | "multi" = "multi") =>
    request<CatalogItem[]>(
      `/movies/search?q=${encodeURIComponent(q)}&type=${type}`,
    ),

  details: (mediaType: "movie" | "tv", id: number) =>
    request<CatalogDetail>(`/movies/${mediaType}/${id}`),

  watchProviders: (
    mediaType: "movie" | "tv",
    id: number,
    region: string,
  ) =>
    request<WatchAvailability>(
      `/movies/${mediaType}/${id}/watch?region=${encodeURIComponent(region)}`,
    ),

  trailer: async (mediaType: "movie" | "tv", id: number) => {
    const res = await request<{
      trailer: {
        name: string;
        site: string;
        youtubeKey: string;
        embedUrl: string;
      } | null;
    }>(`/movies/${mediaType}/${id}/trailer`);
    return res?.trailer ?? null;
  },

  watchlist: (token: string) =>
    request<(CatalogDetail & { addedAt: string })[]>("/watchlist", {}, token),

  toggleWatchlist: (
    token: string,
    mediaType: "movie" | "tv",
    tmdbId: number,
  ) =>
    request<{ onWatchlist: boolean }>(
      `/watchlist/${mediaType}/${tmdbId}/toggle`,
      { method: "POST" },
      token,
    ),

  getRating: async (token: string, mediaType: "movie" | "tv", tmdbId: number) => {
    const res = await request<{ rating: UserRating | null }>(
      `/ratings/${mediaType}/${tmdbId}`,
      {},
      token,
    );
    return res?.rating ?? null;
  },

  rate: (
    token: string,
    data: {
      tmdbId: number;
      mediaType: "movie" | "tv";
      score: number;
      title: string;
      genres: string[];
    },
  ) =>
    request<UserRating>("/ratings", { method: "PUT", body: JSON.stringify(data) }, token),

  removeRating: (token: string, mediaType: "movie" | "tv", tmdbId: number) =>
    request<{ removed: boolean }>(
      `/ratings/${mediaType}/${tmdbId}`,
      { method: "DELETE" },
      token,
    ),

  recordView: (
    token: string,
    data: {
      tmdbId: number;
      mediaType: "movie" | "tv";
      title: string;
      genres: string[];
    },
  ) =>
    request("/ratings/views", { method: "POST", body: JSON.stringify(data) }, token),

  myRatings: (token: string) => request<UserRating[]>("/ratings", {}, token),

  tasteProfile: (token: string) =>
    request<{ genre: string; weight: number; count: number }[]>("/ratings/taste", {}, token),

  recommendations: (
    token: string,
    prefs?: {
      mood?: string;
      experience?: string;
      similarMediaType?: "movie" | "tv";
      similarId?: number;
    },
  ) => {
    const params = new URLSearchParams();
    if (prefs?.mood) params.set("mood", prefs.mood);
    if (prefs?.experience) params.set("experience", prefs.experience);
    if (prefs?.similarMediaType) params.set("similarMediaType", prefs.similarMediaType);
    if (prefs?.similarId != null) params.set("similarId", String(prefs.similarId));
    const qs = params.toString();
    return request<RecommendationsResponse>(
      `/recommendations${qs ? `?${qs}` : ""}`,
      {},
      token,
    );
  },

  moodSuggestions: (
    token: string,
    prefs?: {
      mood?: string;
      experience?: string;
      similarMediaType?: "movie" | "tv";
      similarId?: number;
    },
    limit = 10,
  ) => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (prefs?.mood) params.set("mood", prefs.mood);
    if (prefs?.experience) params.set("experience", prefs.experience);
    if (prefs?.similarMediaType) params.set("similarMediaType", prefs.similarMediaType);
    if (prefs?.similarId != null) params.set("similarId", String(prefs.similarId));
    return request<MoodSuggestionsResponse>(
      `/recommendations/mood-suggestions?${params.toString()}`,
      {},
      token,
    );
  },

  chatMovies: (
    token: string,
    data: {
      message: string;
      history?: { role: "user" | "assistant"; content: string }[];
      region?: string;
    },
  ) =>
    request<ChatMoviesResponse>("/chat/movies", { method: "POST", body: JSON.stringify(data) }, token),

  getFeedback: async (token: string, mediaType: "movie" | "tv", tmdbId: number) => {
    const res = await request<{ feedback: RecommendationFeedback | null }>(
      `/feedback/${mediaType}/${tmdbId}`,
      {},
      token,
    );
    return res?.feedback ?? null;
  },

  submitFeedback: (
    token: string,
    data: {
      tmdbId: number;
      mediaType: "movie" | "tv";
      sentiment: "up" | "down";
      title: string;
      genres: string[];
      comment?: string;
    },
  ) =>
    request<RecommendationFeedback>(
      "/feedback",
      { method: "PUT", body: JSON.stringify(data) },
      token,
    ),

  removeFeedback: (token: string, mediaType: "movie" | "tv", tmdbId: number) =>
    request<{ removed: boolean }>(
      `/feedback/${mediaType}/${tmdbId}`,
      { method: "DELETE" },
      token,
    ),

  friends: (token: string) => request<FriendSummary[]>("/friends", {}, token),

  friendProfile: (token: string, userId: string) =>
    request<FriendProfile>(`/friends/${userId}`, {}, token),

  incomingFriendRequests: (token: string) =>
    request<FriendRequest[]>("/friends/requests/incoming", {}, token),

  outgoingFriendRequests: (token: string) =>
    request<FriendRequest[]>("/friends/requests/outgoing", {}, token),

  sendFriendRequest: (token: string, email: string) =>
    request<FriendRequest>("/friends/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    }, token),

  acceptFriendRequest: (token: string, requestId: string) =>
    request<FriendRequest>(`/friends/requests/${requestId}/accept`, {
      method: "POST",
    }, token),

  rejectFriendRequest: (token: string, requestId: string) =>
    request<FriendRequest>(`/friends/requests/${requestId}/reject`, {
      method: "POST",
    }, token),

  cancelFriendRequest: (token: string, requestId: string) =>
    request<{ cancelled: boolean }>(`/friends/requests/${requestId}`, {
      method: "DELETE",
    }, token),

  removeFriend: (token: string, userId: string) =>
    request<{ removed: boolean }>(`/friends/${userId}`, {
      method: "DELETE",
    }, token),
};

export { ApiError };
