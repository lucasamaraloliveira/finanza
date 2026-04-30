
import React, { useState, useEffect } from 'react';
import { Category, TransactionType, Transaction, CategoryConfig } from '../types';
import { ICONS } from '../constants';
import { handleCurrencyInputChange, parseCurrencyBRL, formatCurrencyBRL } from '../utils/format';

interface TransactionFormProps {
  categories: CategoryConfig[];
  onAdd: (transaction: Transaction, isRecurring: boolean) => void;
  onUpdate?: (transaction: Transaction) => void;
  onCancel?: () => void;
  editData?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ categories, onAdd, onUpdate, onCancel, editData }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState<Category>(categories[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (editData) {
      setDescription(editData.description);
      setAmount(formatCurrencyBRL(editData.amount));
      setType(editData.type);
      setCategory(editData.category);
      setDate(editData.date);
    } else {
      resetFields();
    }
  }, [editData, categories]);

  const resetFields = () => {
    setDescription('');
    setAmount('');
    setType(TransactionType.EXPENSE);
    setCategory(categories[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) return;

    const numericAmount = parseCurrencyBRL(amount);

    if (editData && onUpdate) {
      onUpdate({
        ...editData,
        description,
        amount: numericAmount,
        type,
        category,
        date,
      });
    } else {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        description,
        amount: numericAmount,
        type,
        category,
        date,
        userId: 'default',
      };
      onAdd(newTransaction, isRecurring);
    }
    
    resetFields();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 transition-all relative">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase">
            {editData ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gestão de Fluxo de Caixa</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setType(TransactionType.EXPENSE)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${type === TransactionType.EXPENSE ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
          >
            Saída
          </button>
          <button
            type="button"
            onClick={() => setType(TransactionType.INCOME)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
          >
            Entrada
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Item</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Conta de Luz, Salário..."
            className="px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor (R$)</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(handleCurrencyInputChange(e.target.value))}
              placeholder="0,00"
              className="px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black placeholder:text-slate-300 dark:placeholder:text-slate-600 text-lg"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold appearance-none"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {!editData && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isRecurring ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-sm' : 'bg-transparent border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isRecurring ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <ICONS.Calendar />
                </div>
                <div className="text-left">
                  <p className={`text-xs font-black uppercase tracking-tight ${isRecurring ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    Lançamento Recorrente
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 leading-tight">Agendar para todos os meses</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${isRecurring ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isRecurring ? 'left-6' : 'left-1'}`} />
              </div>
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {editData && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px]"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="flex-[2] flex items-center justify-center gap-3 bg-slate-900 dark:bg-indigo-600 hover:opacity-90 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] uppercase tracking-[0.15em] text-xs"
        >
          {editData ? <ICONS.Edit /> : <ICONS.Plus />}
          {editData ? 'Salvar Alteração' : 'Confirmar Lançamento'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
