
import React from 'react';
import { Budget, Category, Transaction, TransactionType, CategoryConfig } from '../types';
import { handleCurrencyInputChange, parseCurrencyBRL, formatCurrencyBRL } from '../utils/format';

interface BudgetsProps {
  budgets: Budget[];
  transactions: Transaction[];
  categories: CategoryConfig[];
  onSave: (budgets: Budget[]) => void;
}

const Budgets: React.FC<BudgetsProps> = ({ budgets, transactions, categories, onSave }) => {
  const handleLimitChange = (category: Category, displayValue: string) => {
    const limit = parseCurrencyBRL(displayValue);
    const exists = budgets.find(b => b.category === category);
    if (exists) {
      onSave(budgets.map(b => b.category === category ? { ...b, limit } : b));
    } else {
      onSave([...budgets, { id: crypto.randomUUID(), category, limit }]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map(cat => {
          const budget = budgets.find(b => b.category === cat.id);
          const spent = transactions
            .filter(t => t.category === cat.id && t.type === TransactionType.EXPENSE)
            .reduce((acc, t) => acc + t.amount, 0);
          
          const limit = budget?.limit || 0;
          const displayLimit = limit > 0 ? formatCurrencyBRL(limit) : '';
          const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const remaining = limit - spent;

          return (
            <div key={cat.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${cat.color} w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg shadow-sm`}>
                  {cat.icon}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm">{cat.label}</h4>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Gasto: R$ {spent.toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <label className="text-[10px] font-black text-slate-400 uppercase">Limite Mensal</label>
                   <div className="flex items-center gap-1">
                     <span className="text-xs font-bold text-slate-400">R$</span>
                     <input 
                       type="text" 
                       value={displayLimit} 
                       onChange={(e) => handleLimitChange(cat.id, handleCurrencyInputChange(e.target.value))}
                       className="w-24 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-2 py-2 text-right text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                       placeholder="0,00"
                     />
                   </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${percent > 90 ? 'bg-rose-500' : percent > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-bold">
                  <span className={remaining < 0 ? 'text-rose-500' : 'text-slate-400'}>
                    {remaining < 0 ? 'Excedido' : 'Disponível'}: R$ {Math.abs(remaining).toLocaleString('pt-BR')}
                  </span>
                  <span className="text-slate-400">{Math.round(percent)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budgets;
