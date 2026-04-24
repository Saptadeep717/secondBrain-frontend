import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ContentItem } from "@/stores/contentStore";
import { ContentCard } from "@/components/ContentCard";
import { ContentDrawer } from "@/components/ContentDrawer";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) setSearchParams({ q: debouncedQuery });
    else setSearchParams({});
  }, [debouncedQuery, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return null;
      const res = await apiFetch<{
        data: { results: ContentItem[]; fallback?: boolean };
      }>(
        `/api/v1/content/search?q=${encodeURIComponent(debouncedQuery)}&limit=10`,
      );
      return res.data;
    },
    enabled: !!debouncedQuery,
  });

  return (
    <div className="p-6 pb-20 lg:pb-6">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your brain semantically..."
            className="pl-12 pr-16 h-12 text-base bg-secondary border-border"
            autoFocus
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-tertiary font-mono">
            ⌘K
          </span>
        </div>
        <p className="text-xs text-text-tertiary mt-2">
          Semantic search — finds related ideas, not just keywords
        </p>
      </div>

      {data?.fallback && (
        <div className="flex items-center gap-2 text-sm text-status-scraping bg-status-scraping/10 border border-status-scraping/20 rounded-lg p-3 mb-4">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Semantic search temporarily unavailable — showing all content
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-lg" />
          ))}
        </div>
      ) : debouncedQuery && data?.results?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nothing found</h2>
          <p className="text-muted-foreground">
            Try saving more content about this topic
          </p>
        </div>
      ) : data?.results ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {data.results.map((item, i) => (
            <ContentCard
              key={item._id}
              item={item}
              onClick={() => {
                setSelectedItem(item);
                setDrawerOpen(true);
              }}
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      ) : !debouncedQuery ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Search your knowledge</h2>
          <p className="text-muted-foreground">
            Type a query to search semantically across your saved content
          </p>
        </div>
      ) : null}

      <ContentDrawer
        item={selectedItem}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
