'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { transactionService } from '@/services/transaction.service';
import type {
  CategoryPayload,
  FindAllTransactionsQuery,
  SummaryQuery,
  TransactionPayload,
  TransactionType,
} from '@/types/finance';

// ---------- Categories ----------

export function useCategoriesQuery(type?: TransactionType) {
  return useQuery({
    queryKey: ['categories', type ?? 'all'],
    queryFn: () => categoryService.findAll(type),
  });
}

export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryPayload) => categoryService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CategoryPayload> }) =>
      categoryService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
    },
  });
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoryService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

// ---------- Transactions ----------

export function useTransactionsQuery(query: FindAllTransactionsQuery) {
  return useQuery({
    queryKey: ['transactions', query],
    queryFn: () => transactionService.findAll(query),
    placeholderData: keepPreviousData,
  });
}

export function useSummaryQuery(query: SummaryQuery) {
  return useQuery({
    queryKey: ['summary', query],
    queryFn: () => transactionService.getSummary(query),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateTransactions() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['transactions'] });
    qc.invalidateQueries({ queryKey: ['summary'] });
  };
}

export function useCreateTransactionMutation() {
  const invalidate = useInvalidateTransactions();
  return useMutation({
    mutationFn: (payload: TransactionPayload) => transactionService.create(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateTransactionMutation() {
  const invalidate = useInvalidateTransactions();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TransactionPayload> }) =>
      transactionService.update(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteTransactionMutation() {
  const invalidate = useInvalidateTransactions();
  return useMutation({
    mutationFn: (id: number) => transactionService.remove(id),
    onSuccess: invalidate,
  });
}
