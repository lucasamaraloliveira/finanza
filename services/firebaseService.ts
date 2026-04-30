
import { db } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { 
  Transaction, 
  Budget, 
  RecurringTransaction, 
  SavingsGoal, 
  CreditCard, 
  Voucher, 
  VoucherTransaction, 
  CategoryConfig 
} from '../types';

export const firebaseService = {
    // TRANSACTIONS
    getTransactions: async () => {
        const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as unknown as Transaction[];
    },
    saveTransaction: async (transaction: Transaction) => {
        await setDoc(doc(db, 'transactions', transaction.id), transaction);
    },
    saveTransactions: async (transactions: Transaction[]) => {
        const batch = writeBatch(db);
        transactions.forEach(t => {
            const ref = doc(db, 'transactions', t.id);
            batch.set(ref, t);
        });
        await batch.commit();
    },
    deleteTransaction: async (id: string) => {
        await deleteDoc(doc(db, 'transactions', id));
    },

    // BUDGETS
    getBudgets: async () => {
        const querySnapshot = await getDocs(collection(db, 'budgets'));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as unknown as Budget[];
    },
    saveBudgets: async (budgets: Budget[]) => {
        const batch = writeBatch(db);
        budgets.forEach(budget => {
            const ref = doc(db, 'budgets', budget.id || crypto.randomUUID());
            batch.set(ref, budget);
        });
        await batch.commit();
    },

    // CATEGORIES
    getCategories: async () => {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as unknown as CategoryConfig[];
    },
    saveCategories: async (categories: CategoryConfig[]) => {
        const batch = writeBatch(db);
        categories.forEach(category => {
            const ref = doc(db, 'categories', category.id);
            batch.set(ref, category);
        });
        await batch.commit();
    },

    // GOALS
    getGoals: async () => {
        const querySnapshot = await getDocs(collection(db, 'goals'));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as unknown as SavingsGoal[];
    },
    saveGoals: async (goals: SavingsGoal[]) => {
        const batch = writeBatch(db);
        goals.forEach(goal => {
            const ref = doc(db, 'goals', goal.id);
            batch.set(ref, goal);
        });
        await batch.commit();
    },

    // CARDS
    getCards: async () => {
        const querySnapshot = await getDocs(collection(db, 'credit_cards'));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as unknown as CreditCard[];
    },
    saveCards: async (cards: CreditCard[]) => {
        const batch = writeBatch(db);
        cards.forEach(card => {
            const ref = doc(db, 'credit_cards', card.id);
            batch.set(ref, card);
        });
        await batch.commit();
    },

    // VOUCHERS
    getVouchers: async () => {
        const querySnapshot = await getDocs(collection(db, 'vouchers'));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as unknown as Voucher[];
    },
    saveVouchers: async (vouchers: Voucher[]) => {
        const batch = writeBatch(db);
        vouchers.forEach(voucher => {
            const ref = doc(db, 'vouchers', voucher.id);
            batch.set(ref, voucher);
        });
        await batch.commit();
    },
    getVoucherTransactions: async () => {
        const querySnapshot = await getDocs(collection(db, 'voucher_transactions'));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as unknown as VoucherTransaction[];
    },
    saveVoucherTransactions: async (transactions: VoucherTransaction[]) => {
        const batch = writeBatch(db);
        transactions.forEach(t => {
            const ref = doc(db, 'voucher_transactions', t.id);
            batch.set(ref, t);
        });
        await batch.commit();
    },

    // RECURRING
    getRecurring: async () => {
        const querySnapshot = await getDocs(collection(db, 'recurring_transactions'));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as unknown as RecurringTransaction[];
    },
    saveRecurring: async (recurring: RecurringTransaction[]) => {
        const batch = writeBatch(db);
        recurring.forEach(r => {
            const ref = doc(db, 'recurring_transactions', r.id);
            batch.set(ref, r);
        });
        await batch.commit();
    }
};
