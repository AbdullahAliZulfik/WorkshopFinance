export type TransactionType = 'income' | 'expense';

export type TransactionSortField = 'transactionDate' | 'amount' | 'title' | 'createdAt';

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  transactionDate: string; // YYYY-MM-DD
  categoryId: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
}

export interface FindAllTransactionsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: TransactionType;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: TransactionSortField;
  sortOrder?: 'ASC' | 'DESC';
}

export interface SummaryQuery {
  startDate?: string;
  endDate?: string;
}

export interface CategoryPayload {
  name: string;
  type: TransactionType;
}

export interface TransactionPayload {
  title: string;
  amount: number;
  type: TransactionType;
  description?: string;
  transactionDate: string;
  categoryId: number;
}

export interface CategoryTotal {
  categoryId: number;
  name: string;
  type: TransactionType;
  total: number;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  byCategory: CategoryTotal[];
}
