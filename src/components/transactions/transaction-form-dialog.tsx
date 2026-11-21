'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import {
  useCategoriesQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
} from '@/hooks/use-finance';
import { ApiError } from '@/lib/api-client';
import { todayISO } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Transaction, TransactionType } from '@/types/finance';

interface Props {
  open: boolean;
  transaction?: Transaction | null;
  onClose: () => void;
}

export function TransactionFormDialog({ open, transaction, onClose }: Props) {
  // Form di-mount ulang setiap dialog dibuka, sehingga state selalu bersih.
  if (!open) return null;
  return <FormInner transaction={transaction} onClose={onClose} />;
}

function FormInner({
  transaction,
  onClose,
}: {
  transaction?: Transaction | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(transaction);

  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [title, setTitle] = useState(transaction?.title ?? '');
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [date, setDate] = useState(transaction?.transactionDate.slice(0, 10) ?? todayISO());
  const [categoryId, setCategoryId] = useState(transaction ? String(transaction.categoryId) : '');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  const categories = useCategoriesQuery(type);
  const create = useCreateTransactionMutation();
  const update = useUpdateTransactionMutation();
  const pending = create.isPending || update.isPending;

  function changeType(next: TransactionType) {
    if (next === type) return;
    setType(next);
    setCategoryId(''); // kategori harus sesuai dengan jenis transaksi
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      title: title.trim(),
      amount: Number(amount),
      type,
      description: description.trim(),
      transactionDate: date,
      categoryId: Number(categoryId),
    };

    try {
      if (transaction) {
        await update.mutateAsync({ id: transaction.id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errors?.length ? err.errors.join(' • ') : err.message);
      } else {
        setError('Terjadi kesalahan, coba lagi.');
      }
    }
  }

  return (
    <Modal open title={isEdit ? 'Ubah Transaksi' : 'Transaksi Baru'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => changeType(t)}
              className={cn(
                'rounded-md py-2 text-sm font-medium transition-colors',
                type === t
                  ? t === 'income'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                  : 'text-slate-600 hover:text-slate-900',
              )}
            >
              {t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
        </div>

        <Field label="Judul" htmlFor="title">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="mis. Makan siang"
            maxLength={150}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nominal (Rp)" htmlFor="amount">
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25000"
              required
            />
          </Field>
          <Field label="Tanggal" htmlFor="date">
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </Field>
        </div>

        <Field label="Kategori" htmlFor="category">
          <Select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">
              {categories.isLoading ? 'Memuat kategori...' : 'Pilih kategori'}
            </option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          {categories.data?.length === 0 && (
            <p className="text-xs text-amber-600">
              Belum ada kategori {type === 'income' ? 'pemasukan' : 'pengeluaran'}. Buat dulu di
              halaman Kategori.
            </p>
          )}
        </Field>

        <Field label="Keterangan (opsional)" htmlFor="description">
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            Batal
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
