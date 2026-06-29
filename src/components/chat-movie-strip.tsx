"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogItem } from "@/lib/api";

export function ChatMovieStrip({ items }: { items: CatalogItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="-mx-1 mt-3 overflow-x-auto pb-1">
      <ul className="flex gap-3 px-1">
        {items.map((item) => {
          const year = item.releaseDate?.slice(0, 4) ?? "—";
          return (
            <li key={`${item.mediaType}-${item.id}`} className="w-[108px] flex-shrink-0">
              <Link href={`/${item.mediaType}/${item.id}`} className="group block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-elevated ring-1 ring-border transition group-hover:ring-gold/60">
                  {item.posterUrl ? (
                    <Image
                      src={item.posterUrl}
                      alt={item.title}
                      fill
                      sizes="108px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-center text-[10px] text-muted">
                      No poster
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-xs font-semibold text-foreground group-hover:text-gold">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[10px] text-muted">
                  {year} · ★ {item.voteAverage.toFixed(1)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
