import { cn } from '@/lib/utils';
import type { TransactionType } from '@/types/finance';

export function TypeBadge({ type }: { type: TransactionType }) {
  const income = type === 'income';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        income ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
      )}
    >
      {income ? 'Pemasukan' : 'Pengeluaran'}
    </span>
  );
}
