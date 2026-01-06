
import React, { useState, useEffect } from 'react';
import { Transaction, Budget, ViewType, RecurringTransaction, SavingsGoal, CreditCard, Voucher, VoucherTransaction, TransactionType, CategoryConfig } from './types';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import AIAdvisor from './components/AIAdvisor';
import Sidebar from './components/Sidebar';
import ScannerIA from './components/ScannerIA';
import Budgets from './components/Budgets';
import Recurring from './components/Recurring';
import Goals from './components/Goals';
import Cards from './components/Cards';
import CalendarView from './components/CalendarView';
import VoucherManager from './components/VoucherManager';
import CategoryManager from './components/CategoryManager';
import AnnualComparison from './components/AnnualComparison';
import FinancialMascot from './components/FinancialMascot';
import { ICONS, INITIAL_CATEGORIES } from './constants';
import { getFinancialHealthScore } from './services/geminiService';

const App: React.FC = () => {
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('finanza_sidebar_collapsed') === 'true';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('finanza_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    localStorage.setItem('finanza_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const data = {
      transactions: localStorage.getItem('f_transactions'),
      budgets: localStorage.getItem('f_budgets'),
      recurring: localStorage.getItem('f_recurring'),
      goals: localStorage.getItem('f_goals'),
      cards: localStorage.getItem('f_cards'),
      vouchers: localStorage.getItem('f_vouchers'),
      voucherTransactions: localStorage.getItem('f_v_trans'),
      categories: localStorage.getItem('f_categories')
    };
    if (data.transactions) setTransactions(JSON.parse(data.transactions));
    if (data.budgets) setBudgets(JSON.parse(data.budgets));
    if (data.recurring) setRecurring(JSON.parse(data.recurring));
    if (data.goals) setGoals(JSON.parse(data.goals));
    if (data.cards) setCards(JSON.parse(data.cards));
    if (data.vouchers) setVouchers(JSON.parse(data.vouchers));
    if (data.voucherTransactions) setVoucherTransactions(JSON.parse(data.voucherTransactions));
    if (data.categories) setCategories(JSON.parse(data.categories));
  }, []);

  useEffect(() => {
    localStorage.setItem('f_transactions', JSON.stringify(transactions));
    localStorage.setItem('f_budgets', JSON.stringify(budgets));
    localStorage.setItem('f_recurring', JSON.stringify(recurring));
    localStorage.setItem('f_goals', JSON.stringify(goals));
    localStorage.setItem('f_cards', JSON.stringify(cards));
    localStorage.setItem('f_vouchers', JSON.stringify(vouchers));
    localStorage.setItem('f_v_trans', JSON.stringify(voucherTransactions));
    localStorage.setItem('f_categories', JSON.stringify(categories));

    if (transactions.length > 0) {
      getFinancialHealthScore(transactions).then(h => setHealthScore(h.score));
    }
  }, [transactions, budgets, recurring, goals, cards, vouchers, voucherTransactions, categories]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('finanza_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

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

  const addTransaction = (t: Transaction, isRecurring: boolean = false) => {
    setTransactions(prev => [t, ...prev]);
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
      setRecurring(prev => [...prev, newRecurring]);
    }
  };

  const updateTransaction = (t: Transaction) => {
    setTransactions(prev => prev.map(item => item.id === t.id ? t : item));
    setEditingTransaction(null);
  };

  const totalBankBalance = transactions.filter(t => t.type === TransactionType.INCOME).reduce((a, b) => a + b.amount, 0) - 
                          transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, b) => a + b.amount, 0);

  const totalVoucherBalance = vouchers.reduce((acc, v) => acc + v.balance, 0);

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
        return <CategoryManager categories={categories} onUpdate={setCategories} />;
      case 'vouchers':
        return <VoucherManager 
          vouchers={vouchers} 
          transactions={voucherTransactions} 
          onUpdateVouchers={setVouchers} 
          onUpdateTransactions={setVoucherTransactions} 
        />;
      case 'scanner':
        return <ScannerIA onAdd={addTransaction} />;
      case 'budgets':
        return <Budgets budgets={budgets} transactions={transactions} categories={categories} onSave={setBudgets} />;
      case 'recurring':
        return <Recurring recurring={recurring} categories={categories} onSave={setRecurring} />;
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
            <Goals goals={goals} onSave={setGoals} />
          </div>
        );
      case 'cards':
        return <Cards cards={cards} transactions={transactions} onSave={setCards} />;
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
              <div className="xl:col-span-4">
                <TransactionForm 
                  categories={categories}
                  onAdd={addTransaction} 
                  onUpdate={updateTransaction} 
                  editData={editingTransaction} 
                  onCancel={() => setEditingTransaction(null)}
                />
              </div>
              <div className="xl:col-span-8">
                <TransactionList 
                  transactions={transactions} 
                  categories={categories}
                  onDelete={(id) => setTransactions(t => t.filter(x => x.id !== id))} 
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

        <div className="flex-1 w-full max-w-[1920px] mx-auto">
          <main className="p-4 md:p-8 lg:p-12 space-y-12">
             <div className="hidden lg:block">
               <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1">
                      {view === 'dashboard' ? 'Overview' : 
                       view === 'transactions' ? 'Histórico' : 
                       view === 'budgets' ? 'Planejamento' : 
                       view === 'recurring' ? 'Assinaturas' : 
                       view === 'goals' ? 'Metas e Invest.' : 
                       view === 'cards' ? 'Carteira' : 
                       view === 'vouchers' ? 'Benefícios' :
                       view === 'categories' ? 'Categorias' :
                       view === 'annual_comparison' ? 'Comparativo' :
                       view === 'calendar' ? 'Calendário' : 'Scanner'}
                    </h2>
                    <div className="flex items-center gap-2">
                       <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                       <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Finança Residencial</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-3xl border border-white/40 dark:border-slate-800">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Bancário</p>
                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                          R$ {totalBankBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                        <ICONS.Dashboard />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-emerald-50/50 dark:bg-emerald-900/10 backdrop-blur-sm p-4 rounded-3xl border border-emerald-100/40 dark:border-emerald-800/20">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-widest">Saldo VA/VR</p>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          R$ {totalVoucherBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                        <ICONS.Plus />
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
};

export default App;
