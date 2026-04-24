import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ContentItem } from "@/stores/contentStore";
import { ContentCard } from "@/components/ContentCard";
import { ContentDrawer } from "@/components/ContentDrawer";
import { BASE_URL } from "@/lib/api";
import { useState } from "react";
import { Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicBrainPage() {
  const { shareLink } = useParams<{ shareLink: string }>();
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-brain", shareLink],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/brain/${shareLink}`);
      if (!res.ok) throw new Error("Brain not found");
      const json = await res.json();
      return json.data as ContentItem[];
    },
    enabled: !!shareLink,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <h1 className="font-semibold">Shared Brain</h1>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Brain className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Brain not found</h2>
            <p className="text-muted-foreground">
              This link may have expired or been removed
            </p>
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {data.map((item) => (
              <ContentCard
                key={item._id}
                item={item}
                onClick={() => {
                  setSelectedItem(item);
                  setDrawerOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-muted-foreground">
              This brain has no content yet
            </p>
          </div>
        )}
      </main>
      <footer className="border-t border-border py-4 text-center text-xs text-text-tertiary">
        Built with Second Brain
      </footer>
      <ContentDrawer
        item={selectedItem}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
