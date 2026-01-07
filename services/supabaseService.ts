import { supabase } from './supabaseClient';
import { Transaction, Budget, RecurringTransaction, SavingsGoal, CreditCard, Voucher, VoucherTransaction, CategoryConfig } from '../types';

export const supabaseService = {
    // TRANSACTIONS
    getTransactions: async () => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });
        if (error) throw error;
        return data as Transaction[];
    },
    saveTransaction: async (transaction: Transaction) => {
        const { error } = await supabase.from('transactions').upsert(transaction);
        if (error) throw error;
    },
    deleteTransaction: async (id: string) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
    },

    // BUDGETS
    getBudgets: async () => {
        const { data, error } = await supabase.from('budgets').select('*');
        if (error) throw error;
        return data as Budget[];
    },
    saveBudgets: async (budgets: Budget[]) => {
        // Para simplificar, deletamos e reinserimos ou usamos upsert se o schema permitir
        const { error } = await supabase.from('budgets').upsert(budgets);
        if (error) throw error;
    },

    // CATEGORIES
    getCategories: async () => {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        return data as CategoryConfig[];
    },
    saveCategories: async (categories: CategoryConfig[]) => {
        const { error } = await supabase.from('categories').upsert(categories);
        if (error) throw error;
    },

    // GOALS
    getGoals: async () => {
        const { data, error } = await supabase.from('goals').select('*');
        if (error) throw error;
        return data as SavingsGoal[];
    },
    saveGoals: async (goals: SavingsGoal[]) => {
        const { error } = await supabase.from('goals').upsert(goals);
        if (error) throw error;
    },

    // CARDS
    getCards: async () => {
        const { data, error } = await supabase.from('credit_cards').select('*');
        if (error) throw error;
        return data as CreditCard[];
    },
    saveCards: async (cards: CreditCard[]) => {
        const { error } = await supabase.from('credit_cards').upsert(cards);
        if (error) throw error;
    },

    // VOUCHERS
    getVouchers: async () => {
        const { data, error } = await supabase.from('vouchers').select('*');
        if (error) throw error;
        return data as Voucher[];
    },
    saveVouchers: async (vouchers: Voucher[]) => {
        const { error } = await supabase.from('vouchers').upsert(vouchers);
        if (error) throw error;
    },
    getVoucherTransactions: async () => {
        const { data, error } = await supabase.from('voucher_transactions').select('*');
        if (error) throw error;
        return data as VoucherTransaction[];
    },
    saveVoucherTransactions: async (transactions: VoucherTransaction[]) => {
        const { error } = await supabase.from('voucher_transactions').upsert(transactions);
        if (error) throw error;
    },

    // RECURRING
    getRecurring: async () => {
        const { data, error } = await supabase.from('recurring_transactions').select('*');
        if (error) throw error;
        return data as RecurringTransaction[];
    },
    saveRecurring: async (recurring: RecurringTransaction[]) => {
        const { error } = await supabase.from('recurring_transactions').upsert(recurring);
        if (error) throw error;
    }
};
