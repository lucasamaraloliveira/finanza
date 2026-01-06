
import React, { useState, useEffect } from 'react';
import { RecurringTransaction, Category, TransactionType, CategoryConfig } from '../types';
import { ICONS } from '../constants';
import { handleCurrencyInputChange, parseCurrencyBRL, formatCurrencyBRL } from '../utils/format';

interface RecurringProps {
  recurring: RecurringTransaction[];
  categories: CategoryConfig[];
  onSave: (items: RecurringTransaction[]) => void;
}

const Recurring: React.FC<RecurringProps> = ({ recurring, categories, onSave }) => {
  const [desc, setDesc] = useState('');
  const [val, setVal] = useState('');
  const [day, setDay] = useState('1');
  const [cat, setCat] = useState<Category>(categories[0]?.id || '');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (editingId) {
      const item = recurring.find(r => r.id === editingId);
      if (item) {
        setDesc(item.description);
        setVal(formatCurrencyBRL(item.amount));
        setDay(item.dayOfMonth.toString());
        setCat(item.category);
      }
    } else {
      setDesc('');
      setVal('');
      setDay('1');
      setCat(categories[0]?.id || '');
    }
  }, [editingId, recurring, categories]);

  const handleSave = () => {
    if (!desc || !val) return;
    
    const numericVal = parseCurrencyBRL(val);
    
    if (editingId) {
      onSave(recurring.map(r => r.id === editingId ? {
        ...r,
        description: desc,
        amount: numericVal,
        category: cat,
        dayOfMonth: parseInt(day),
      } : r));
      setEditingId(null);
    } else {
      const newItem: RecurringTransaction = {
        id: crypto.randomUUID(),
        description: desc,
        amount: numericVal,
        category: cat,
        dayOfMonth: parseInt(day),
        type: TransactionType.EXPENSE
      };
      onSave([...recurring, newItem]);
    }
    setDesc('');
    setVal('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">
            {editingId ? 'Editar Conta Fixa' : 'Nova Conta Fixa'}
          </h3>
          <div className="space-y-4">
            <input 
              type="text" value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Ex: Aluguel, Netflix..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            />
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" value={val} onChange={e => setVal(handleCurrencyInputChange(e.target.value))}
                placeholder="Valor R$"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-black"
              />
              <input 
                type="number" value={day} onChange={e => setDay(e.target.value)}
                placeholder="Dia (1-31)" min="1" max="31"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              />
            </div>
            <select 
              value={cat} onChange={e => setCat(e.target.value as Category)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
            <div className="flex gap-2">
              {editingId && (
                <button 
                  onClick={() => setEditingId(null)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 py-4 rounded-2xl font-black uppercase text-[10px]"
                >
                  Cancelar
                </button>
              )}
              <button 
                onClick={handleSave}
                className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
              >
                {editingId ? 'Atualizar Item' : 'Agendar Recorrência'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="xl:col-span-8 space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Dia</th>
                <th className="px-8 py-5">Descrição</th>
                <th className="px-8 py-5">Categoria</th>
                <th className="px-8 py-5 text-right">Valor</th>
                <th className="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recurring.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-5 font-black text-indigo-600 dark:text-indigo-400 text-sm">{item.dayOfMonth}</td>
                  <td className="px-8 py-5 font-bold text-slate-700 dark:text-slate-200">{item.description}</td>
                  <td className="px-8 py-5 text-xs font-medium text-slate-500">{item.category}</td>
                  <td className="px-8 py-5 text-right font-black text-rose-500">R$ {item.amount.toLocaleString('pt-BR')}</td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => setEditingId(item.id)} className="text-slate-300 hover:text-indigo-500 transition-colors">
                        <ICONS.Edit />
                      </button>
                      <button onClick={() => onSave(recurring.filter(r => r.id !== item.id))} className="text-slate-300 hover:text-rose-500 transition-colors">
                        <ICONS.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {recurring.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-medium italic">Nenhum custo fixo agendado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Recurring;
