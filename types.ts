
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

// Category agora é string para permitir novas categorias dinâmicas
export type Category = string;

export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  hex: string;
  isSystem?: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  userId: string;
  cardId?: string;
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: Category;
  dayOfMonth: number;
  type: TransactionType;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface Voucher {
  id: string;
  name: string;
  type: 'VA' | 'VR';
  balance: number;
  color: string;
}

export interface VoucherTransaction {
  id: string;
  voucherId: string;
  description: string;
  amount: number;
  date: string;
  type: 'CREDIT' | 'DEBIT';
}

export interface FinancialProfile {
  id: string;
  name: string;
  avatar: string;
}

export type ViewType = 'dashboard' | 'transactions' | 'budgets' | 'recurring' | 'goals' | 'cards' | 'calendar' | 'scanner' | 'vouchers' | 'categories' | 'annual_comparison';
