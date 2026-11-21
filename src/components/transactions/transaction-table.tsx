import { Button } from '@/components/ui/button';
import { TypeBadge } from '@/components/ui/badge';
import { formatDate, formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types/finance';

export function TransactionTable({
  items,
  onEdit,
  onDelete,
}: {
  items: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Transaksi</th>
            <th className="px-4 py-3 font-medium">Kategori</th>
            <th className="px-4 py-3 text-right font-medium">Nominal</th>
            <th className="px-4 py-3 text-right font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {formatDate(t.transactionDate)}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{t.title}</p>
                {t.description && (
                  <p className="line-clamp-1 text-xs text-slate-500">{t.description}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-slate-700">{t.category?.name}</span>
                  <TypeBadge type={t.type} />
                </div>
              </td>
              <td
                className={cn(
                  'whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums',
                  t.type === 'income' ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {t.type === 'income' ? '+' : '−'}
                {formatRupiah(t.amount)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>
                  Ubah
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => onDelete(t)}
                >
                  Hapus
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
