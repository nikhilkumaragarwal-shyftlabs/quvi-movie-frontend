import { api, type CatalogItem } from "@/lib/api";
import { detectRegion } from "@/lib/detect-region";
import { filterByFeaturedKeys } from "@/lib/streaming-platforms";

export async function filterFeaturedCatalog<T extends Pick<CatalogItem, "id" | "mediaType">>(
  items: T[],
  region?: string,
  limit = 12,
): Promise<T[]> {
  if (items.length === 0) return [];

  const resolvedRegion = region ?? (await detectRegion());
  const pool = items.slice(0, Math.max(limit * 2, 18));
  const available = await api.filterFeatured(
    pool.map(({ id, mediaType }) => ({ id, mediaType })),
    resolvedRegion,
    limit,
  );
  return filterByFeaturedKeys(items, available);
}
