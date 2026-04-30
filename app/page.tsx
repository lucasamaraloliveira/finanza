'use client';

import React, { useState, useEffect } from 'react';
import {
  Transaction,
  Budget,
  ViewType,
  RecurringTransaction,
  SavingsGoal,
  CreditCard,
  Voucher,
  VoucherTransaction,
  TransactionType,
  CategoryConfig
} from '../types';
import Dashboard from '../components/Dashboard';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import AIAdvisor from '../components/AIAdvisor';
import Sidebar from '../components/Sidebar';
import ScannerIA from '../components/ScannerIA';
import Budgets from '../components/Budgets';
import Recurring from '../components/Recurring';
import Goals from '../components/Goals';
import Cards from '../components/Cards';
import CalendarView from '../components/CalendarView';
import VoucherManager from '../components/VoucherManager';
import CategoryManager from '../components/CategoryManager';
import AnnualComparison from '../components/AnnualComparison';
import FinancialMascot from '../components/FinancialMascot';
import SubNav from '../components/SubNav';
import { ICONS, INITIAL_CATEGORIES, VIEW_GROUPS } from '../constants';
import { getFinancialHealthScore } from '../services/geminiService';
import { firebaseService } from '../services/firebaseService';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import Login from '../components/Login';

export default function Home() {
  const [view, setView] = useState<ViewType>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherTransactions, setVoucherTransactions] = useState<VoucherTransaction[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>(INITIAL_CATEGORIES);
  const [healthScore, setHealthScore] = useState(70);
  const [lastAction, setLastAction] = useState<'income' | 'expense' | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadData();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize theme and sidebar state
  useEffect(() => {
    const collapsed = localStorage.getItem('finanza_sidebar_collapsed') === 'true';
    setIsSidebarCollapsed(collapsed);

    const savedTheme = localStorage.getItem('finanza_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Sync sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('finanza_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Sync theme to document and localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('finanza_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Initial data load from Firebase
  const loadData = async () => {
    try {
      const [
        tData, bData, rData, gData, cData, vData, vtData, catData
      ] = await Promise.all([
        firebaseService.getTransactions(),
        firebaseService.getBudgets(),
        firebaseService.getRecurring(),
        firebaseService.getGoals(),
        firebaseService.getCards(),
        firebaseService.getVouchers(),
        firebaseService.getVoucherTransactions(),
        firebaseService.getCategories()
      ]);

      if (tData.length > 0) setTransactions(tData);
      if (bData.length > 0) setBudgets(bData);
      if (rData.length > 0) setRecurring(rData);
      if (gData.length > 0) setGoals(gData);
      if (cData.length > 0) setCards(cData);
      if (vData.length > 0) setVouchers(vData);
      if (vtData.length > 0) setVoucherTransactions(vtData);
      if (catData.length > 0) setCategories(catData);

      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados do Firebase:", error);
      setLoading(false);
    }
  };

  // Update health score when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      getFinancialHealthScore(transactions).then(h => setHealthScore(h.score));
    }
  }, [transactions]);

  const exportCSV = () => {
    const headers = "Data,Descricao,Categoria,Valor,Tipo\n";
    const rows = transactions.map(t => `${t.date},${t.description},${t.category},${t.amount},${t.type}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanza-relatorio-${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  const addTransaction = async (t: Transaction, isRecurring: boolean = false) => {
    const newTransactions = [t, ...transactions];
    setTransactions(newTransactions);
    await firebaseService.saveTransaction(t);

    setLastAction(t.type === TransactionType.INCOME ? 'income' : 'expense');
    setTimeout(() => setLastAction(null), 3000);

    if (isRecurring) {
      const day = new Date(t.date).getDate() + 1;
      const newRecurring: RecurringTransaction = {
        id: crypto.randomUUID(),
        description: t.description,
        amount: t.amount,
        category: t.category,
        type: t.type,
        dayOfMonth: day > 31 ? 31 : (day === 0 ? 1 : day)
      };
      const updatedRecurring = [...recurring, newRecurring];
      setRecurring(updatedRecurring);
      await firebaseService.saveRecurring(updatedRecurring);
    }
  };

  const updateTransaction = async (t: Transaction) => {
    const updated = transactions.map(item => item.id === t.id ? t : item);
    setTransactions(updated);
    await firebaseService.saveTransaction(t);
    setEditingTransaction(null);
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter(x => x.id !== id);
    setTransactions(updated);
    await firebaseService.deleteTransaction(id);
  };

  const handleSetBudgets = async (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    await firebaseService.saveBudgets(newBudgets);
  };

  const handleSetRecurring = async (newRecurring: RecurringTransaction[]) => {
    setRecurring(newRecurring);
    await firebaseService.saveRecurring(newRecurring);
  };

  const handleSetGoals = async (newGoals: SavingsGoal[]) => {
    setGoals(newGoals);
    await firebaseService.saveGoals(newGoals);
  };

  const handleSetCards = async (newCards: CreditCard[]) => {
    setCards(newCards);
    await firebaseService.saveCards(newCards);
  };

  const handleSetVouchers = async (newVouchers: Voucher[]) => {
    setVouchers(newVouchers);
    await firebaseService.saveVouchers(newVouchers);
  };

  const handleSetVoucherTransactions = async (newVT: VoucherTransaction[]) => {
    setVoucherTransactions(newVT);
    await firebaseService.saveVoucherTransactions(newVT);
  };

  const handleSetCategories = async (newCats: CategoryConfig[]) => {
    setCategories(newCats);
    await firebaseService.saveCategories(newCats);
  };

  const totalBankBalance = (transactions.filter(t => t.type === TransactionType.INCOME).reduce((a, b) => a + b.amount, 0) -
    transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, b) => a + b.amount, 0)) + 
    cards.reduce((acc, c) => acc + (c.balance || 0), 0);

  const totalVoucherBalance = vouchers.reduce((acc, v) => acc + v.balance, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">CARREGANDO FINANZA...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col gap-8">
              <div className="w-full">
                <AIAdvisor transactions={transactions} budgets={budgets} />
              </div>

              <Dashboard
                transactions={transactions}
                budgets={budgets}
                vouchers={vouchers}
                isDarkMode={isDarkMode}
                categories={categories}
              />
            </div>
          </div>
        );
      case 'annual_comparison':
        return <AnnualComparison transactions={transactions} isDarkMode={isDarkMode} categories={categories} />;
      case 'categories':
        return <CategoryManager categories={categories} onUpdate={handleSetCategories} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
      case 'vouchers':
        return <VoucherManager
          vouchers={vouchers}
          transactions={voucherTransactions}
          onUpdateVouchers={handleSetVouchers}
          onUpdateTransactions={handleSetVoucherTransactions}
        />;
      case 'scanner':
        return <ScannerIA onAdd={addTransaction} />;
      case 'budgets':
        return <Budgets budgets={budgets} transactions={transactions} categories={categories} onSave={handleSetBudgets} />;
      case 'recurring':
        return <Recurring recurring={recurring} categories={categories} onSave={handleSetRecurring} />;
      case 'goals':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Metas e Investimentos</h2>
                <p className="text-slate-500 text-sm">Construindo seu patrimônio passo a passo</p>
              </div>
              <FinancialMascot score={healthScore} />
            </div>
            <Goals goals={goals} onSave={handleSetGoals} />
          </div>
        );
      case 'cards':
        return <Cards cards={cards} transactions={transactions} onSave={handleSetCards} />;
      case 'calendar':
        return <CalendarView transactions={transactions} recurring={recurring} />;
      case 'transactions':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Lançamentos</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Controle granular do fluxo de caixa residencial</p>
              </div>
              <button onClick={exportCSV} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95">
                <ICONS.Download /> Exportar CSV
              </button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-5 2xl:col-span-4">
                <TransactionForm
                  categories={categories}
                  onAdd={addTransaction}
                  onUpdate={updateTransaction}
                  editData={editingTransaction}
                  onCancel={() => setEditingTransaction(null)}
                />
              </div>
              <div className="xl:col-span-7 2xl:col-span-8">
                <TransactionList
                  transactions={transactions}
                  categories={categories}
                  onDelete={deleteTransaction}
                  onEdit={(t) => { setEditingTransaction(t); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-6">
            <div className="p-8 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] scale-150">
              <ICONS.History />
            </div>
            <button onClick={() => setView('dashboard')} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
              Voltar ao Dashboard
            </button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-indigo-500/10"></div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Sincronizando Ecosystem...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-500 overflow-x-hidden">
      <Sidebar
        view={view}
        setView={(v) => { setView(v); setEditingTransaction(null); }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-72'}`}>
        <header className="lg:hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-5 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white font-bold text-lg shadow-lg">F</div>
            <span className="font-black tracking-tighter text-indigo-600 dark:text-indigo-400">FINANZA</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
          >
            <ICONS.Menu />
          </button>
        </header>

        <div className="lg:hidden px-4 pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Banco</p>
              <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">R$ {totalBankBalance.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">VA/VR</p>
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">R$ {totalVoucherBalance.toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-none pb-2">
            <SubNav currentView={view} setView={setView} />
          </div>
        </div>

        <div className="flex-1 w-full max-w-[1920px] mx-auto">
          <main className="p-4 md:p-8 lg:p-12 space-y-12">
            <div className="hidden lg:block">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Finança Residencial</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <h2 className="text-3xl xl:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase whitespace-nowrap">
                      {Object.values(VIEW_GROUPS).find(g => g.views.some(v => v.id === view))?.label || 'Overview'}
                    </h2>
                    <SubNav currentView={view} setView={setView} />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-3 rounded-2xl border border-white/20 dark:border-slate-800 flex-shrink-0 shadow-sm">
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <ICONS.Dashboard />
                    </div>
                    <div className="text-right pr-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap leading-none mb-1">Banco</p>
                      <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap leading-none">
                        R$ {totalBankBalance.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-900/10 backdrop-blur-md p-3 rounded-2xl border border-emerald-100/20 dark:border-emerald-800/20 flex-shrink-0 shadow-sm">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <ICONS.Plus />
                    </div>
                    <div className="text-right pr-1">
                      <p className="text-[8px] font-black text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-widest whitespace-nowrap leading-none mb-1">VA/VR</p>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap leading-none">
                        R$ {totalVoucherBalance.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-screen pb-20">
              {renderContent()}
            </div>
          </main>
        </div>

        <footer className="py-10 px-12 border-t border-slate-200/50 dark:border-slate-800/50 mt-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-[1920px] mx-auto text-slate-400">
            <p className="text-xs font-medium italic opacity-70">"Poder é ter controle sobre o próprio futuro."</p>
            <p className="text-[10px] font-bold tracking-widest uppercase">&copy; {new Date().getFullYear()} FINANZA v2.5</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
