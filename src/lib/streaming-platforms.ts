export const FEATURED_PLATFORM_NAMES = [
  "Netflix",
  "HBO Max",
  "Apple TV+",
  "Hulu",
  "Peacock",
] as const;

export const FEATURED_PLATFORMS_LABEL = FEATURED_PLATFORM_NAMES.join(", ");

export function catalogItemKey(item: { id: number; mediaType: string }) {
  return `${item.mediaType}-${item.id}`;
}

export function filterByFeaturedKeys<T extends { id: number; mediaType: string }>(
  items: T[],
  available: { id: number; mediaType: string }[],
): T[] {
  const keys = new Set(available.map(catalogItemKey));
  return items.filter((item) => keys.has(catalogItemKey(item)));
}
