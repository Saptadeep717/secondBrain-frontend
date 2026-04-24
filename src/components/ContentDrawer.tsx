import { ContentItem } from '@/stores/contentStore';
import { StatusBadge } from '@/components/StatusBadge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ExternalLink, LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pipelineSteps = ['pending', 'scraping', 'scraped', 'enriched'] as const;

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

interface ContentDrawerProps {
  item: ContentItem | null;
  open: boolean;
  onClose: () => void;
}

export function ContentDrawer({ item, open, onClose }: ContentDrawerProps) {
  const navigate = useNavigate();
  if (!item) return null;

  const currentStepIndex = pipelineSteps.indexOf(item.status as any);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto scrollbar-thin bg-card border-l border-border">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg font-semibold leading-snug pr-8">{item.title || 'Untitled'}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* URL */}
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-mono text-muted-foreground truncate">{getDomain(item.link)}</span>
            <Button variant="ghost" size="sm" className="ml-auto shrink-0" onClick={() => window.open(item.link, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-1" /> Open
            </Button>
          </div>

          {/* Pipeline */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Processing Pipeline</p>
            <div className="flex items-center gap-1">
              {pipelineSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-1 flex-1">
                  <div className={`h-1.5 flex-1 rounded-full transition-colors ${
                    item.status === 'failed' ? 'bg-status-failed/40' :
                    i <= currentStepIndex ? 'bg-primary' : 'bg-border'
                  }`} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {pipelineSteps.map((step) => (
                <span key={step} className="text-[10px] text-text-tertiary capitalize">{step}</span>
              ))}
            </div>
            {item.status === 'failed' && (
              <div className="mt-2"><StatusBadge status="failed" /></div>
            )}
          </div>

          {/* Summary */}
          {item.summary && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">Summary</p>
              <p className="text-sm leading-relaxed">{item.summary}</p>
            </div>
          )}

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span key={tag.name} className="text-xs bg-secondary px-2.5 py-1 rounded-md text-muted-foreground">{tag.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex gap-4 text-xs text-text-tertiary">
            <span>Type: <span className="capitalize">{item.contentType}</span></span>
            <span>Saved: {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Suggested Topics */}
          {item.suggestedTopics && item.suggestedTopics.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">You might want to explore</p>
              <div className="flex flex-wrap gap-1.5">
                {item.suggestedTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => { onClose(); navigate(`/search?q=${encodeURIComponent(topic)}`); }}
                    className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md hover:bg-primary/20 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
