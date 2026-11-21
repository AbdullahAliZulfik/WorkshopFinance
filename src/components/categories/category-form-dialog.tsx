'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '@/hooks/use-finance';
import { ApiError } from '@/lib/api-client';
import type { Category, TransactionType } from '@/types/finance';

interface Props {
  open: boolean;
  category?: Category | null;
  onClose: () => void;
}

export function CategoryFormDialog({ open, category, onClose }: Props) {
  if (!open) return null;
  return <FormInner category={category} onClose={onClose} />;
}

function FormInner({ category, onClose }: { category?: Category | null; onClose: () => void }) {
  const isEdit = Boolean(category);
  const [name, setName] = useState(category?.name ?? '');
  const [type, setType] = useState<TransactionType>(category?.type ?? 'expense');
  const [error, setError] = useState<string | null>(null);

  const create = useCreateCategoryMutation();
  const update = useUpdateCategoryMutation();
  const pending = create.isPending || update.isPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { name: name.trim(), type };

    try {
      if (category) {
        await update.mutateAsync({ id: category.id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.errors?.length
            ? err.errors.join(' • ')
            : err.message
          : 'Terjadi kesalahan, coba lagi.',
      );
    }
  }

  return (
    <Modal open title={isEdit ? 'Ubah Kategori' : 'Kategori Baru'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nama kategori" htmlFor="cat-name">
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mis. Makanan & Minuman"
            maxLength={100}
            required
          />
        </Field>

        <Field label="Jenis" htmlFor="cat-type">
          <Select
            id="cat-type"
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </Select>
        </Field>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            Batal
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
