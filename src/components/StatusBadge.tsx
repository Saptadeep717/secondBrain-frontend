import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Status = 'pending' | 'scraping' | 'scraped' | 'enriched' | 'failed';

const statusConfig: Record<Status, { label: string; className: string; pulse: boolean }> = {
  pending: { label: 'Pending', className: 'bg-status-pending/20 text-status-pending border-status-pending/30', pulse: true },
  scraping: { label: 'Scraping...', className: 'bg-status-scraping/20 text-status-scraping border-status-scraping/30', pulse: true },
  scraped: { label: 'Scraped', className: 'bg-status-scraped/20 text-status-scraped border-status-scraped/30', pulse: false },
  enriched: { label: 'Enriched', className: 'bg-status-enriched/20 text-status-enriched border-status-enriched/30', pulse: false },
  failed: { label: 'Failed', className: 'bg-status-failed/20 text-status-failed border-status-failed/30', pulse: false },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge variant="outline" className={cn('text-xs font-medium border', config.className, config.pulse && 'animate-pulse-status')}>
      {config.label}
    </Badge>
  );
}
