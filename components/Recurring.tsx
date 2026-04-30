
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
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [lastDeletedItem, setLastDeletedItem] = useState<RecurringTransaction | null>(null);
  const [showUndo, setShowUndo] = useState(false);

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

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    const item = recurring.find(r => r.id === itemToDelete);
    if (item) {
      setLastDeletedItem(item);
      onSave(recurring.filter(r => r.id !== itemToDelete));
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 5000);
    }
    setItemToDelete(null);
  };

  const handleUndo = () => {
    if (lastDeletedItem) {
      onSave([...recurring, lastDeletedItem]);
      setLastDeletedItem(null);
      setShowUndo(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Undo Toast */}
      {showUndo && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Conta Fixa Excluída</p>
              <p className="text-sm font-bold">{lastDeletedItem?.description}</p>
            </div>
            <button 
              onClick={handleUndo}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Desfazer
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setItemToDelete(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ICONS.Trash />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Excluir Conta?</h3>
                <p className="text-slate-500 text-sm">Tem certeza que deseja remover o custo fixo <b>{recurring.find(r => r.id === itemToDelete)?.description}</b>? Esta ação interromperá os lançamentos automáticos.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-6 py-4 rounded-2xl bg-rose-600 text-white font-black uppercase text-xs hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R$</span>
                <input 
                  type="text" value={val} onChange={e => setVal(handleCurrencyInputChange(e.target.value))}
                  placeholder="Valor"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-black text-sm"
                />
              </div>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dia</span>
                <input 
                  type="number" value={day} onChange={e => setDay(e.target.value)}
                  placeholder="Dia" min="1" max="31"
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-center pr-12"
                />
              </div>
            </div>
            <div className="relative">
              <select 
                value={cat} onChange={e => setCat(e.target.value as Category)}
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold appearance-none cursor-pointer pr-10 text-slate-700 dark:text-slate-200"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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
                      <button onClick={() => confirmDelete(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
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
