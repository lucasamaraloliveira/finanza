
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, CategoryConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnnualComparisonProps {
  transactions: Transaction[];
  isDarkMode: boolean;
  categories: CategoryConfig[];
}

const AnnualComparison: React.FC<AnnualComparisonProps> = ({ transactions, isDarkMode, categories }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const years = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(new Date().getFullYear());
    transactions.forEach(t => yearsSet.add(new Date(t.date).getFullYear()));
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    return months.map((month, index) => {
      const filtered = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedYear && d.getMonth() === index;
      });

      const income = filtered
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = filtered
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

      // Composição de categorias para este mês
      const catExpenses: Record<string, number> = {};
      categories.forEach(cat => {
        catExpenses[cat.id] = filtered
          .filter(t => t.type === TransactionType.EXPENSE && t.category === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);
      });

      return {
        name: month,
        Entradas: income,
        Saídas: expense,
        Saldo: income - expense,
        ...catExpenses
      };
    });
  }, [transactions, selectedYear, categories]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    categories.forEach(cat => {
      totals[cat.id] = transactions
        .filter(t => {
          const d = new Date(t.date);
          return d.getFullYear() === selectedYear && t.type === TransactionType.EXPENSE && t.category === cat.id;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    });

    return Object.entries(totals)
      .map(([id, value]) => {
        const config = categories.find(c => c.id === id);
        return {
          id,
          label: config?.label || id,
          value,
          color: config?.hex || '#cbd5e1',
          icon: config?.icon || '✨'
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [transactions, selectedYear, categories]);

  const annualTotals = useMemo(() => {
    return monthlyData.reduce((acc, curr) => ({
      income: acc.income + curr.Entradas,
      expense: acc.expense + curr.Saídas,
      balance: acc.balance + curr.Saldo
    }), { income: 0, expense: 0, balance: 0 });
  }, [monthlyData]);

  const tooltipStyles = {
    contentStyle: {
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      border: 'none',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      padding: '12px',
      zIndex: 100
    },
    itemStyle: {
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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Comparativo Anual</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Análise detalhada do fluxo de caixa e despesas por categoria</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Ano base:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-transparent border-none outline-none font-black text-indigo-600 dark:text-indigo-400 px-4 cursor-pointer"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm group">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Entradas Anuais</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">R$ {annualTotals.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-2 italic">Total de receitas em {selectedYear}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm group">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Saídas Anuais</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">R$ {annualTotals.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-2 italic">Total de gastos em {selectedYear}</p>
        </div>

        <div className={`p-8 rounded-[2rem] border shadow-sm group ${annualTotals.balance >= 0 ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${annualTotals.balance >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>Balanço Líquido</p>
          <h3 className={`text-3xl font-black ${annualTotals.balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
            R$ {annualTotals.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 mt-2 italic">Resultado acumulado do ano</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Fluxo de Caixa Mensal</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-[10px] font-black text-slate-400 uppercase">Receitas</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div><span className="text-[10px] font-black text-slate-400 uppercase">Despesas</span></div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
                  tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000) + 'k' : value}`}
                />
                <Tooltip 
                  cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }}
                  contentStyle={tooltipStyles.contentStyle}
                  itemStyle={tooltipStyles.itemStyle}
                  labelStyle={tooltipStyles.labelStyle}
                />
                <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Saídas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Composição Mensal de Gastos</h4>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Por Categoria</span>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }}
                  contentStyle={tooltipStyles.contentStyle}
                  itemStyle={tooltipStyles.itemStyle}
                  labelStyle={tooltipStyles.labelStyle}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
                {categories.map(cat => (
                  <Bar 
                    key={cat.id} 
                    dataKey={cat.id} 
                    name={cat.label} 
                    stackId="a" 
                    fill={cat.hex} 
                    radius={[0, 0, 0, 0]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm h-full">
          <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter mb-8">Distribuição Anual</h4>
          <div className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryTotals}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryTotals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={tooltipStyles.contentStyle}
                  itemStyle={tooltipStyles.itemStyle}
                  labelStyle={tooltipStyles.labelStyle}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Gastos</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">R$ {(annualTotals.expense / 1000).toFixed(1)}k</span>
            </div>
          </div>
          <div className="space-y-4 mt-8">
            {categoryTotals.slice(0, 5).map(cat => {
              const perc = ((cat.value / annualTotals.expense) * 100).toFixed(1);
              return (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat.icon} {cat.label}</span>
                  </div>
                  <span className="text-xs font-black text-slate-500">{perc}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800">
             <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Detalhamento Numérico Mensal</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Mês</th>
                  <th className="px-8 py-5">Receitas</th>
                  <th className="px-8 py-5">Despesas</th>
                  <th className="px-8 py-5 text-right">Saldo Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {monthlyData.map((data, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-900 dark:text-slate-100">{data.name}</td>
                    <td className="px-8 py-5 font-bold text-emerald-600 dark:text-emerald-400">R$ {data.Entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-8 py-5 font-bold text-rose-600 dark:text-rose-400">R$ {data.Saídas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className={`px-8 py-5 text-right font-black ${data.Saldo >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                      <div className="flex items-center justify-end gap-2">
                        R$ {data.Saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        {data.Saldo > 0 ? (
                          <span className="text-emerald-500">↑</span>
                        ) : data.Saldo < 0 ? (
                          <span className="text-rose-500">↓</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
           <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Despesas por Categoria (Ranking Anual)</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800">
          {categoryTotals.map(cat => (
            <div key={cat.id} className="bg-white dark:bg-slate-900 p-8 flex items-center justify-between group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                  {cat.icon}
                </div>
                <div>
                  <h5 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-tight">{cat.label}</h5>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Anual</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900 dark:text-white">R$ {cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(cat.value / categoryTotals[0].value) * 100}%`, backgroundColor: cat.color }}></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400">{((cat.value / annualTotals.expense) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnualComparison;
