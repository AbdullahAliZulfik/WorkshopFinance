'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TransactionFilters, emptyFilters, type FilterState } from './transaction-filters';
import { TransactionFormDialog } from './transaction-form-dialog';
import { TransactionTable } from './transaction-table';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useDeleteTransactionMutation, useTransactionsQuery } from '@/hooks/use-finance';
import { ApiError } from '@/lib/api-client';
import type { Transaction } from '@/types/finance';

const PAGE_SIZE = 10;

export function TransactionsView() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const debouncedSearch = useDebouncedValue(filters.search);

  const query = useTransactionsQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    type: filters.type || undefined,
    categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    sortBy: 'transactionDate',
    sortOrder: 'DESC',
  });
  const remove = useDeleteTransactionMutation();

  const items = query.data?.items ?? [];
  const meta = query.data?.meta;

  function changeFilters(next: FilterState) {
    setFilters(next);
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(t: Transaction) {
    setEditing(t);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      setDeleting(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
    } catch {
      // pesan error ditampilkan di dialog lewat remove.error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transaksi</h1>
          <p className="text-sm text-slate-500">Riwayat pemasukan dan pengeluaranmu.</p>
        </div>
        <Button onClick={openCreate}>+ Transaksi Baru</Button>
      </div>

      <Card>
        <TransactionFilters value={filters} onChange={changeFilters} />
        <div className="border-t border-slate-200">
          {query.isLoading ? (
            <p className="p-10 text-center text-sm text-slate-500">Memuat transaksi...</p>
          ) : query.isError ? (
            <p className="p-10 text-center text-sm text-rose-600">
              {query.error instanceof ApiError ? query.error.message : 'Gagal memuat data.'}
            </p>
          ) : items.length === 0 ? (
            <p className="p-10 text-center text-sm text-slate-500">
              Belum ada transaksi yang cocok.
            </p>
          ) : (
            <TransactionTable items={items} onEdit={openEdit} onDelete={setDeleting} />
          )}
        </div>

        {meta && meta.totalItems > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
            <span>
              Halaman {meta.page} dari {meta.totalPages} · {meta.totalItems} transaksi
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!meta.hasPreviousPage}
                onClick={() => setPage(page - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!meta.hasNextPage}
                onClick={() => setPage(page + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      <TransactionFormDialog
        open={formOpen}
        transaction={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Hapus transaksi?"
        description={`Transaksi "${deleting?.title ?? ''}" akan dihapus permanen.`}
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
