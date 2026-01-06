
import React from 'react';
import { Transaction, RecurringTransaction, TransactionType } from '../types';

interface CalendarProps {
  transactions: Transaction[];
  recurring: RecurringTransaction[];
}

const CalendarView: React.FC<CalendarProps> = ({ transactions, recurring }) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1);
  const padding = Array.from({ length: firstDay }).map((_, i) => i);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">
          {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Despesas</div>
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Fixos</div>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-4 bg-slate-50 dark:bg-slate-800/30">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 border-t border-slate-100 dark:border-slate-800">
        {padding.map(i => <div key={`p-${i}`} className="h-32 border-r border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/10"></div>)}
        {days.map(day => {
          const dayDate = new Date(year, month, day).toISOString().split('T')[0];
          const dayTransactions = transactions.filter(t => t.date === dayDate);
          const dayRecurring = recurring.filter(r => r.dayOfMonth === day);
          const isToday = day === now.getDate();

          return (
            <div key={day} className={`h-32 border-r border-b border-slate-50 dark:border-slate-800/50 p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-black ${isToday ? 'bg-indigo-600 text-white w-6 h-6 rounded-lg flex items-center justify-center' : 'text-slate-400'}`}>{day}</span>
              </div>
              <div className="space-y-1 overflow-y-auto max-h-20 scrollbar-none">
                {dayRecurring.map(r => (
                  <div key={r.id} className="text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border-l-2 border-indigo-500 truncate">
                    {r.description}
                  </div>
                ))}
                {dayTransactions.map(t => (
                  <div key={t.id} className={`text-[9px] font-bold ${t.type === TransactionType.INCOME ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-500' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-500'} px-1.5 py-0.5 rounded border-l-2 truncate`}>
                    {t.description}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
