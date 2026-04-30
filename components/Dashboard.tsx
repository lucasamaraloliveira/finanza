
import React, { useEffect, useState } from 'react';
import { Transaction, TransactionType, Budget, Voucher, CategoryConfig } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { getFinancialHealthScore } from '../services/geminiService';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  categories: CategoryConfig[];
  vouchers?: Voucher[];
  isDarkMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets, categories, vouchers = [], isDarkMode }) => {
  const [mounted, setMounted] = useState(false);
  const [health, setHealth] = useState({ score: 0, message: 'Calculando...' });

  useEffect(() => {
    setMounted(true);
  }, []);
  const forecastPeriod = 30; 

  useEffect(() => {
    if (transactions.length > 0) {
      getFinancialHealthScore(transactions).then(setHealth);
    }
  }, [transactions]);

  const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const totalVoucherBalance = vouchers.reduce((acc, v) => acc + v.balance, 0);

  const forecastData = Array.from({ length: forecastPeriod }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() + i);
    const dailyAvgExpense = totalExpense > 0 ? totalExpense / 30 : 0;
    return { 
      name: day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), 
      balance: balance - (dailyAvgExpense * i) 
    };
  });

  const categoryData = categories.map(cat => {
    const value = transactions.filter(t => t.category === cat.id && t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
    return { name: cat.label, value, hex: cat.hex };
  }).filter(item => item.value > 0);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (health.score / 100) * circumference;

  const tooltipStyles = {
    contentStyle: {
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      border: 'none',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      padding: '12px',
      zIndex: 50
    },
    itemStyle: {
      color: isDarkMode ? '#f8fafc' : '#1e293b',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    labelStyle: {
      color: isDarkMode ? '#94a3b8' : '#64748b',
      fontSize: '11px',
      fontWeight: '900',
      textTransform: 'uppercase' as const,
      marginBottom: '4px'
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/20 flex flex-col md:flex-row items-center gap-8 border border-white/10">
        <div className="relative flex-shrink-0 w-32 h-32 flex items-center justify-center bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/20" />
            <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-white transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black tracking-tighter">{health.score}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Score</span>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Análise IA</span>
            <h3 className="text-2xl font-black tracking-tight">Saúde Financeira da Casa</h3>
          </div>
          <p className="text-indigo-100 text-sm leading-relaxed max-w-2xl font-medium italic">
            "{health.message}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-slate-200/50 dark:border-slate-800/50 transition-all hover:shadow-lg group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors whitespace-nowrap">Saldo Bancário</p>
          <h2 className={`text-4xl font-black tracking-tighter whitespace-nowrap ${balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-[10px] font-bold text-slate-300 dark:text-slate-500 mt-2 whitespace-nowrap">Disponível em contas e cartões</p>
        </div>

        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-slate-200/50 dark:border-slate-800/50 transition-all hover:shadow-lg group">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 whitespace-nowrap">Saldo VA/VR Total</p>
          <h2 className="text-4xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            R$ {totalVoucherBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex gap-2 mt-2 flex-wrap">
            {vouchers.map(v => (
              <span key={v.id} className="text-[9px] font-black uppercase bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800">
                {v.type}: {v.balance.toLocaleString()}
              </span>
            ))}
            {vouchers.length === 0 && <span className="text-[10px] text-slate-400 italic">Nenhum cartão configurado</span>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-slate-200/50 dark:border-slate-800/50 transition-all hover:shadow-lg lg:col-span-1 md:col-span-2">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Metas de Orçamentos</h4>
           <div className="space-y-4">
              {budgets.length === 0 ? (
                <div className="py-2 text-slate-400 text-sm font-medium italic">Sem orçamentos ativos.</div>
              ) : (
                budgets.slice(0, 2).map(b => {
                  const spent = transactions.filter(t => t.category === b.category && t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
                  const percent = Math.min(Math.round((spent / b.limit) * 100), 100);
                  const cat = categories.find(c => c.id === b.category);
                  return (
                    <div key={b.category} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">{cat?.label || b.category}</span>
                        <span className="text-[10px] font-bold text-slate-400">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                        <div className={`h-full transition-all duration-1000 shadow-sm ${percent > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-slate-200/50 dark:border-slate-800/50 h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Projeção de Fluxo</h3>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full whitespace-nowrap">
              Próximos 30 dias
            </span>
          </div>
          {mounted && (
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} dy={10} hide={true} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyles.contentStyle} itemStyle={tooltipStyles.itemStyle} labelStyle={tooltipStyles.labelStyle} formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Saldo Projetado']} />
                <Area type="monotone" dataKey="balance" stroke="#6366f1" fillOpacity={1} fill="url(#colorBal)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-slate-200/50 dark:border-slate-800/50 h-[450px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Distribuição</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Por Categoria</span>
          </div>
          {mounted && (
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="40%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.hex} className="outline-none filter drop-shadow-md" />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyles.contentStyle} itemStyle={tooltipStyles.itemStyle} labelStyle={tooltipStyles.labelStyle} formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Legend verticalAlign="bottom" height={80} formatter={(value) => <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-tighter">{value}</span>} iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
