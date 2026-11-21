'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SummaryCards } from './summary-cards';
import { TransactionFormDialog } from '@/components/transactions/transaction-form-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/field';
import { useSummaryQuery, useTransactionsQuery } from '@/hooks/use-finance';
import { ApiError } from '@/lib/api-client';
import { formatDate, formatRupiah, monthRange } from '@/lib/format';
import { cn } from '@/lib/utils';

export function DashboardView() {
  const [range, setRange] = useState(monthRange());
  const [formOpen, setFormOpen] = useState(false);

  const summary = useSummaryQuery({
    startDate: range.startDate || undefined,
    endDate: range.endDate || undefined,
  });
  const recent = useTransactionsQuery({
    page: 1,
    limit: 5,
    startDate: range.startDate || undefined,
    endDate: range.endDate || undefined,
    sortBy: 'transactionDate',
    sortOrder: 'DESC',
  });

  const expenseBreakdown = (summary.data?.byCategory ?? []).filter((c) => c.type === 'expense');
  const maxExpense = Math.max(1, ...expenseBreakdown.map((c) => c.total));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500">Ringkasan keuangan untuk periode terpilih.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>+ Transaksi Baru</Button>
      </div>

      <Card className="flex flex-wrap items-end gap-3 p-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Dari</label>
          <Input
            type="date"
            value={range.startDate}
            onChange={(e) => setRange({ ...range, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Sampai</label>
          <Input
            type="date"
            value={range.endDate}
            onChange={(e) => setRange({ ...range, endDate: e.target.value })}
          />
        </div>
        <Button variant="secondary" onClick={() => setRange(monthRange())}>
          Bulan ini
        </Button>
        <Button variant="ghost" onClick={() => setRange({ startDate: '', endDate: '' })}>
          Semua waktu
        </Button>
      </Card>

      {summary.isError ? (
        <Card className="p-6 text-sm text-rose-600">
          {summary.error instanceof ApiError ? summary.error.message : 'Gagal memuat ringkasan.'}
        </Card>
      ) : (
        <SummaryCards summary={summary.data} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Pengeluaran per Kategori</h2>
          <div className="mt-4 space-y-3">
            {expenseBreakdown.length === 0 && (
              <p className="text-sm text-slate-500">Belum ada pengeluaran pada periode ini.</p>
            )}
            {expenseBreakdown.map((c) => (
              <div key={c.categoryId}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-700">{c.name}</span>
                  <span className="tabular-nums text-slate-900">{formatRupiah(c.total)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-rose-500"
                    style={{ width: `${(c.total / maxExpense) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Transaksi Terbaru</h2>
            <Link href="/transactions" className="text-sm text-slate-500 hover:text-slate-900">
              Lihat semua →
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {recent.data?.items.length === 0 && (
              <li className="py-2 text-sm text-slate-500">Belum ada transaksi.</li>
            )}
            {recent.data?.items.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{t.title}</p>
                  <p className="text-xs text-slate-500">
                    {t.category?.name} · {formatDate(t.transactionDate)}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-sm font-semibold tabular-nums',
                    t.type === 'income' ? 'text-emerald-600' : 'text-rose-600',
                  )}
                >
                  {t.type === 'income' ? '+' : '−'}
                  {formatRupiah(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <TransactionFormDialog open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
