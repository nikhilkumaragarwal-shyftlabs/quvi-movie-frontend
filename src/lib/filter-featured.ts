import { api, type CatalogItem } from "@/lib/api";
import { detectRegion } from "@/lib/detect-region";
import { filterByFeaturedKeys } from "@/lib/streaming-platforms";

export async function filterFeaturedCatalog<T extends Pick<CatalogItem, "id" | "mediaType">>(
  items: T[],
): Promise<T[]> {
  if (items.length === 0) return [];

  const region = await detectRegion();
  const available = await api.filterFeatured(
    items.map(({ id, mediaType }) => ({ id, mediaType })),
    region,
  );
  return filterByFeaturedKeys(items, available);
}
