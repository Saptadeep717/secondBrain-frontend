import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DigestData {
  digest: {
    headline: string;
    themes: { topic: string; count: number; insight: string }[];
    highlight: string;
    suggestion: string;
  };
  count: number;
  days: number;
  period: { from: string; to: string };
  fallback?: boolean;
}

export default function DigestPage() {
  const [days, setDays] = useState(7);
  const navigate = useNavigate();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['digest', days],
    queryFn: async () => {
      const res = await apiFetch<{ data: DigestData }>(`/api/v1/ai/digest?days=${days}`);
      return res.data;
    },
  });

  const maxCount = data?.digest?.themes ? Math.max(...data.digest.themes.map((t) => t.count)) : 1;

  return (
    <div className="p-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="7">7 days</TabsTrigger>
            {/* <TabsTrigger value="14">14 days</TabsTrigger> */}
            <TabsTrigger value="30">30 days</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} /> Regenerate
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-lg" />
          <p className="text-sm text-muted-foreground text-center">AI is synthesising your week...</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        </div>
      ) : !data?.digest ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nothing saved in the last {days} days</h2>
          <p className="text-muted-foreground">Start saving content to see your digest</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hero */}
          <div className="bg-card border border-primary/20 rounded-lg p-6 bg-gradient-to-br from-primary/5 to-transparent">
            <h2 className="text-xl font-semibold mb-2">{data.digest.headline}</h2>
            <p className="text-sm text-muted-foreground">{data.count} items saved · {data.days} day period</p>
          </div>

          {/* Themes */}
          {data.digest.themes?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Themes</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {data.digest.themes.map((theme) => (
                  <div key={theme.topic} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{theme.topic}</h4>
                      <span className="text-xs text-muted-foreground">{theme.count} items</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{theme.insight}</p>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(theme.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlight & Suggestion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {data.digest.highlight && (
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">This week's highlight</span>
                </div>
                <p className="text-sm">{data.digest.highlight}</p>
              </div>
            )}
            {data.digest.suggestion && (
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">What to explore next</span>
                </div>
                <p className="text-sm mb-3">{data.digest.suggestion}</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/search')}>
                  Explore <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
