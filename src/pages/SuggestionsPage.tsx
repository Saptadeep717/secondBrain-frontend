import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SaveContentModal } from "@/components/SaveContentModal";

interface SuggestionsData {
  suggestions: { topic: string; count: number }[];
  categories?: {
    category: string;
    topics: { topic: string; count: number }[];
  }[];
  graphSuggestions: string[];
  totalContentAnalyzed: number;
}

export default function SuggestionsPage() {
  const navigate = useNavigate();
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTag, setSaveTag] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      const res = await apiFetch<{ data: SuggestionsData }>(
        "/api/v1/ai/suggestions?limit=15",
      );
      return res.data;
    },
  });

  const maxCount = data?.suggestions
    ? Math.max(...data.suggestions.map((s) => s.count), 1)
    : 1;

  return (
    <div className="p-6 pb-20 lg:pb-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Your Knowledge Gaps</h2>
        <p className="text-sm text-muted-foreground">
          Topics your saved content keeps pointing to — but you haven't explored
          yet
          {data && (
            <span>
              {" "}
              · Based on {data.totalContentAnalyzed} items in your brain
            </span>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-lg" />
          ))}
        </div>
      ) : !data?.suggestions?.length && !data?.graphSuggestions?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Lightbulb className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No suggestions yet</h2>
          <p className="text-muted-foreground">
            Save and enrich more content to discover your knowledge gaps
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {data?.categories && data.categories.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Categorized Suggestions
              </h3>
              <div className="space-y-3">
                {data.categories.map((category) => (
                  <div
                    key={category.category}
                    className="bg-card border border-border rounded-lg"
                  >
                    <details className="group">
                      <summary className="cursor-pointer px-4 py-3 font-semibold flex items-center justify-between">
                        <span>{category.category}</span>
                        <span className="text-xs text-muted-foreground">
                          {category.topics.length} topics
                        </span>
                      </summary>
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {category.topics.map((topic) => (
                            <div
                              key={topic.topic}
                              className="bg-secondary/50 border border-border rounded-lg p-3"
                            >
                              <h4 className="font-semibold text-sm mb-2 break-words leading-snug">
                                {topic.topic}
                              </h4>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {topic.count} items
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="p-1"
                                    onClick={() =>
                                      navigate(
                                        `/search?q=${encodeURIComponent(topic.topic)}`,
                                      )
                                    }
                                    aria-label={`Search ${topic.topic}`}
                                  >
                                    <Search className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="p-1"
                                    onClick={() => {
                                      setSaveTag(topic.topic);
                                      setSaveOpen(true);
                                    }}
                                    aria-label={`Save ${topic.topic}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Most Suggested Topics
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {data.suggestions.map((s) => (
                  <div
                    key={s.topic}
                    className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <h4 className="font-semibold text-sm mb-3 break-words leading-snug">
                      {s.topic}
                    </h4>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(s.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {s.count} items suggest
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/search?q=${encodeURIComponent(s.topic)}`)
                        }
                      >
                        <Search className="w-3 h-3 mr-1" /> Search this
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSaveTag(s.topic);
                          setSaveOpen(true);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Save something
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data?.graphSuggestions && data.graphSuggestions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                From Your Knowledge Graph
              </h3>
              <p className="text-xs text-text-tertiary mb-3">
                Topics identified from your content relationships
              </p>
              <div className="flex flex-wrap gap-2">
                {data.graphSuggestions.map((topic) => (
                  <button
                    key={topic}
                    onClick={() =>
                      navigate(`/search?q=${encodeURIComponent(topic)}`)
                    }
                    className="text-sm bg-secondary px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors break-words max-w-[220px] text-left"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <SaveContentModal
        open={saveOpen}
        onClose={() => {
          setSaveOpen(false);
          setSaveTag("");
        }}
        initialTag={saveTag}
      />
    </div>
  );
}
