
import React, { useState, useEffect } from 'react';
import { CreditCard, Transaction, TransactionType } from '../types';
import { ICONS } from '../constants';

interface CardsProps {
  cards: CreditCard[];
  transactions: Transaction[];
  onSave: (cards: CreditCard[]) => void;
}

const Cards: React.FC<CardsProps> = ({ cards, transactions, onSave }) => {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [due, setDue] = useState('10');
  const [balance, setBalance] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (editingId) {
      const card = cards.find(c => c.id === editingId);
      if (card) {
        setName(card.name);
        setLimit(card.limit.toString());
        setBalance((card.balance || 0).toString());
        setDue(card.dueDay.toString());
      }
    } else {
      setName('');
      setLimit('');
      setBalance('');
      setDue('10');
    }
  }, [editingId, cards]);

  const handleSave = () => {
    if (!name || !limit) return;
    
    const cardData = {
      name,
      limit: parseFloat(limit),
      balance: parseFloat(balance) || 0,
      closingDay: Math.max(1, parseInt(due) - 7),
      dueDay: parseInt(due),
    };

    if (editingId) {
      onSave(cards.map(c => c.id === editingId ? {
        ...c,
        ...cardData
      } : c));
      setEditingId(null);
    } else {
      const newCard: CreditCard = {
        id: crypto.randomUUID(),
        ...cardData,
        color: `bg-gradient-to-br from-slate-800 to-slate-900`
      };
      onSave([...cards, newCard]);
    }
    setName('');
    setLimit('');
    setBalance('');
    setDue('10');
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col justify-center gap-4">
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">
            {editingId ? 'Editar Cartão' : 'Novo Cartão'}
          </h3>
          <div className="space-y-3">
             <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Instituição (Ex: Nubank)" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold" />
             <div className="grid grid-cols-2 gap-3">
               <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Limite Crédito" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-black" />
               <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="Saldo Conta" className="w-full px-4 py-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border-none outline-none font-black text-emerald-600" />
             </div>
             <input type="number" value={due} onChange={e => setDue(e.target.value)} placeholder="Dia do Vencimento" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold" />
             <div className="flex gap-2">
                {editingId && (
                  <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 py-4 rounded-xl font-black uppercase text-[10px]">Cancelar</button>
                )}
                <button onClick={handleSave} className="flex-[2] bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-lg">
                  {editingId ? 'Salvar' : 'Adicionar Cartão'}
                </button>
             </div>
          </div>
        </div>

        {cards.map(card => {
          // Em um app real, filtraríamos transações vinculadas a este card
          const spent = 0; 
          const percent = Math.min((spent / card.limit) * 100, 100);
          
          return (
            <div key={card.id} className={`${card.color} p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20 relative group overflow-hidden`}>
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
              
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                   <ICONS.Cards />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(card.id)} className="text-white/20 hover:text-indigo-400 transition-colors">
                    <ICONS.Edit />
                  </button>
                  <button onClick={() => onSave(cards.filter(c => c.id !== card.id))} className="text-white/20 hover:text-rose-400 transition-colors">
                    <ICONS.Trash />
                  </button>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-1">Titularidade</h4>
                  <p className="text-xl font-black tracking-tighter uppercase">{card.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                    <span>Limite Utilizado</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex justify-between font-black text-xs">
                    <span>R$ {spent.toLocaleString()}</span>
                    <span>R$ {card.limit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-8 pt-2">
                   <div>
                     <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Vencimento</p>
                     <p className="text-xs font-bold">Dia {card.dueDay}</p>
                   </div>
                   <div>
                     <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Fechamento</p>
                     <p className="text-xs font-bold">Dia {card.closingDay}</p>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Cards;
