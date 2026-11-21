'use client';

import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';
import { useCategoriesQuery } from '@/hooks/use-finance';
import type { TransactionType } from '@/types/finance';

export interface FilterState {
  search: string;
  type: '' | TransactionType;
  categoryId: string;
  startDate: string;
  endDate: string;
}

export const emptyFilters: FilterState = {
  search: '',
  type: '',
  categoryId: '',
  startDate: '',
  endDate: '',
};

export function TransactionFilters({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const categories = useCategoriesQuery(value.type || undefined);
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });
  const active = JSON.stringify(value) !== JSON.stringify(emptyFilters);

  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
      <Input
        className="lg:col-span-2"
        placeholder="Cari judul / keterangan..."
        value={value.search}
        onChange={(e) => set({ search: e.target.value })}
      />
      <Select
        value={value.type}
        onChange={(e) => set({ type: e.target.value as FilterState['type'], categoryId: '' })}
      >
        <option value="">Semua jenis</option>
        <option value="income">Pemasukan</option>
        <option value="expense">Pengeluaran</option>
      </Select>
      <Select value={value.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
        <option value="">Semua kategori</option>
        {categories.data?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Input
        type="date"
        aria-label="Dari tanggal"
        value={value.startDate}
        onChange={(e) => set({ startDate: e.target.value })}
      />
      <Input
        type="date"
        aria-label="Sampai tanggal"
        value={value.endDate}
        onChange={(e) => set({ endDate: e.target.value })}
      />
      {active && (
        <div className="sm:col-span-2 lg:col-span-6">
          <Button variant="ghost" size="sm" onClick={() => onChange(emptyFilters)}>
            Reset filter
          </Button>
        </div>
      )}
    </div>
  );
}
