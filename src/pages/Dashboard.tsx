import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useContentStore, ContentItem } from '@/stores/contentStore';
import { ContentCard } from '@/components/ContentCard';
import { ContentDrawer } from '@/components/ContentDrawer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, FileText, Hash, TrendingUp, Plus } from 'lucide-react';
import { SaveContentModal } from '@/components/SaveContentModal';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { items, setItems } = useContentStore();
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [tagFilter, setTagFilter] = useState('all');
  const [saveOpen, setSaveOpen] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      const res = await apiFetch<{ data: ContentItem[] }>('/api/v1/content');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const contentData = useQuery({ queryKey: ['content'] }).data as ContentItem[] | undefined;
  useEffect(() => {
    if (contentData) setItems(contentData);
  }, [contentData, setItems]);

  const allTags = useMemo(() => [...new Set(items.flatMap((i) => i.tags.map((t) => t.name)))].sort(), [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (typeFilter !== 'all') result = result.filter((i) => i.contentType === typeFilter);
    if (statusFilter !== 'all') result = result.filter((i) => i.status === statusFilter);
    if (tagFilter !== 'all') result = result.filter((i) => i.tags.some((t) => t.name === tagFilter));
    result.sort((a, b) => sortBy === 'newest'
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return result;
  }, [items, typeFilter, statusFilter, sortBy, tagFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      total: items.length,
      enriched: items.filter((i) => i.status === 'enriched').length,
      tags: allTags.length,
      thisWeek: items.filter((i) => new Date(i.createdAt) >= weekAgo).length,
    };
  }, [items, allTags]);

  const statCards = [
    { label: 'Total Saved', value: stats.total, icon: Brain },
    { label: 'Enriched', value: stats.enriched, icon: FileText },
    { label: 'Tags Used', value: stats.tags, icon: Hash },
    { label: 'This Week', value: stats.thisWeek, icon: TrendingUp },
  ];

  return (
    <div className="p-6 pb-20 lg:pb-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Icon className="w-4 h-4" />
              <span className="text-xs">{label}</span>
            </div>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px] bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="article">Article</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="enriched">Enriched</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[120px] bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
        {allTags.length > 0 && (
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[150px] bg-secondary border-border"><SelectValue placeholder="Filter by tag" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((tag) => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-lg" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Brain className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your brain is empty</h2>
          <p className="text-muted-foreground mb-4">Save your first URL to get started</p>
          <Button onClick={() => setSaveOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Save URL
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredItems.map((item, i) => (
            <ContentCard
              key={item._id}
              item={item}
              onClick={() => { setSelectedItem(item); setDrawerOpen(true); }}
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      )}

      <ContentDrawer item={selectedItem} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <SaveContentModal open={saveOpen} onClose={() => setSaveOpen(false)} />
    </div>
  );
}
