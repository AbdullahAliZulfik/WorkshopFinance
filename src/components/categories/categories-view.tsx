'use client';

import { useState } from 'react';
import { CategoryFormDialog } from './category-form-dialog';
import { TypeBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useCategoriesQuery, useDeleteCategoryMutation } from '@/hooks/use-finance';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { Category, TransactionType } from '@/types/finance';

const tabs: { value: '' | TransactionType; label: string }[] = [
  { value: '', label: 'Semua' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
];

export function CategoriesView() {
  const [tab, setTab] = useState<'' | TransactionType>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const query = useCategoriesQuery(tab || undefined);
  const remove = useDeleteCategoryMutation();

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // pesan error ditampilkan di dialog lewat remove.error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kategori</h1>
          <p className="text-sm text-slate-500">Kelompokkan transaksi berdasarkan kategori.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Kategori Baru
        </Button>
      </div>

      <div className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              tab === t.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {query.isLoading ? (
          <p className="p-10 text-center text-sm text-slate-500">Memuat kategori...</p>
        ) : query.isError ? (
          <p className="p-10 text-center text-sm text-rose-600">
            {query.error instanceof ApiError ? query.error.message : 'Gagal memuat data.'}
          </p>
        ) : query.data?.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">Belum ada kategori.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {query.data?.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900">{c.name}</span>
                  <TypeBadge type={c.type} />
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(c);
                      setFormOpen(true);
                    }}
                  >
                    Ubah
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50"
                    onClick={() => setDeleting(c)}
                  >
                    Hapus
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <CategoryFormDialog open={formOpen} category={editing} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Hapus kategori?"
        description={`Kategori "${deleting?.name ?? ''}" akan dihapus. Kategori yang masih dipakai transaksi tidak bisa dihapus.`}
        loading={remove.isPending}
        error={remove.error instanceof ApiError ? remove.error.message : null}
        onConfirm={confirmDelete}
        onClose={() => {
          setDeleting(null);
          remove.reset();
        }}
      />
    </div>
  );
}
