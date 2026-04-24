import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { ContentItem } from '@/stores/contentStore';
import { ContentCard } from '@/components/ContentCard';
import { ContentDrawer } from '@/components/ContentDrawer';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Copy, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SharedPage() {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareHash, setShareHash] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: async (share: boolean) => {
      const res = await apiFetch<{ data?: { hash?: string } }>('/api/v1/brain/share', {
        method: 'POST',
        body: JSON.stringify({ share }),
      });
      return { share, hash: res.data?.hash };
    },
    onSuccess: (result) => {
      setIsShared(result.share);
      setShareHash(result.share ? result.hash || null : null);
      toast.success(result.share ? 'Brain shared!' : 'Brain is now private');
    },
  });

  const { data: publicItems } = useQuery({
    queryKey: ['shared-preview', shareHash],
    queryFn: async () => {
      if (!shareHash) return [];
      const res = await apiFetch<{ data: ContentItem[] }>(`/api/v1/brain/${shareHash}`);
      return res.data;
    },
    enabled: !!shareHash,
  });

  const shareUrl = shareHash ? `${window.location.origin}/brain/${shareHash}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 pb-20 lg:pb-6">
      {/* Toggle Card */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Share your brain publicly</h3>
            <p className="text-sm text-muted-foreground">Anyone with the link can view your saved content</p>
          </div>
          <Switch checked={isShared} onCheckedChange={(checked) => shareMutation.mutate(checked)} />
        </div>
        {isShared && shareUrl && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 bg-secondary rounded-md px-3 py-2 text-sm font-mono text-muted-foreground truncate">
              {shareUrl}
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        )}
        {!isShared && (
          <p className="text-sm text-text-tertiary mt-3">Your brain is private</p>
        )}
      </div>

      {/* Preview */}
      {isShared && publicItems && publicItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">This is what visitors see</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {publicItems.map((item) => (
              <ContentCard key={item._id} item={item} onClick={() => { setSelectedItem(item); setDrawerOpen(true); }} />
            ))}
          </div>
        </div>
      )}

      {isShared && (!publicItems || publicItems.length === 0) && (
        <div className="flex flex-col items-center py-12 text-center">
          <Share2 className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No content to preview</p>
        </div>
      )}

      <ContentDrawer item={selectedItem} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
