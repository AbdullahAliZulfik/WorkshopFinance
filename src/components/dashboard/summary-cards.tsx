import { Card } from '@/components/ui/card';
import { formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { FinanceSummary } from '@/types/finance';

export function SummaryCards({ summary }: { summary?: FinanceSummary }) {
  const items = [
    {
      label: 'Saldo',
      value: summary?.balance,
      note: 'Pemasukan − pengeluaran',
      tone: (summary?.balance ?? 0) < 0 ? 'text-rose-600' : 'text-slate-900',
    },
    {
      label: 'Total Pemasukan',
      value: summary?.totalIncome,
      note: `${summary?.incomeCount ?? 0} transaksi`,
      tone: 'text-emerald-600',
    },
    {
      label: 'Total Pengeluaran',
      value: summary?.totalExpense,
      note: `${summary?.expenseCount ?? 0} transaksi`,
      tone: 'text-rose-600',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="p-5">
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className={cn('mt-2 text-2xl font-semibold tabular-nums', item.tone)}>
            {item.value === undefined ? '—' : formatRupiah(item.value)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{item.note}</p>
        </Card>
      ))}
    </div>
  );
}
