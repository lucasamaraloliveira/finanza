
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
  const [closing, setClosing] = useState('3');
  const [balance, setBalance] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [lastDeletedCard, setLastDeletedCard] = useState<CreditCard | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  // Helper to format currency
  const formatCurrency = (value: string) => {
    const nums = value.replace(/\D/g, "");
    if (!nums) return "";
    const amount = (parseInt(nums) / 100).toFixed(2);
    return amount.replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
  };

  useEffect(() => {
    if (editingId) {
      const card = cards.find(c => c.id === editingId);
      if (card) {
        setName(card.name);
        setLimit(formatCurrency((card.limit * 100).toFixed(0)));
        setBalance(formatCurrency(((card.balance || 0) * 100).toFixed(0)));
        setDue(card.dueDay.toString());
        setClosing(card.closingDay.toString());
      }
    } else {
      setName('');
      setLimit('');
      setBalance('');
      setDue('10');
      setClosing('3');
    }
  }, [editingId, cards]);

  const handleSave = () => {
    if (!name || !limit) return;
    
    const cardData = {
      name,
      limit: parseCurrency(limit),
      balance: parseCurrency(balance),
      closingDay: Math.max(1, Math.min(31, parseInt(closing))),
      dueDay: Math.max(1, Math.min(31, parseInt(due))),
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
    setClosing('3');
  };

  const confirmDelete = (id: string) => {
    setCardToDelete(id);
  };

  const handleDelete = () => {
    if (!cardToDelete) return;
    const card = cards.find(c => c.id === cardToDelete);
    if (card) {
      setLastDeletedCard(card);
      onSave(cards.filter(c => c.id !== cardToDelete));
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 5000);
    }
    setCardToDelete(null);
  };

  const handleUndo = () => {
    if (lastDeletedCard) {
      onSave([...cards, lastDeletedCard]);
      setLastDeletedCard(null);
      setShowUndo(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Undo Toast */}
      {showUndo && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cartão Excluído</p>
              <p className="text-sm font-bold">{lastDeletedCard?.name}</p>
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
      {cardToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setCardToDelete(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ICONS.Trash />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Excluir Cartão?</h3>
                <p className="text-slate-500 text-sm">Tem certeza que deseja remover o cartão <b>{cards.find(c => c.id === cardToDelete)?.name}</b>? Esta ação afetará o saldo total da carteira.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setCardToDelete(null)}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col justify-center gap-4">
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">
            {editingId ? 'Editar Cartão' : 'Novo Cartão'}
          </h3>
          <div className="space-y-3">
             <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Instituição (Ex: Nubank)" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold" 
             />
             <div className="grid grid-cols-2 gap-3">
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R$</span>
                 <input 
                    type="text" 
                    value={limit} 
                    onChange={e => setLimit(formatCurrency(e.target.value))} 
                    placeholder="Limite" 
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-black text-sm" 
                 />
               </div>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-400">R$</span>
                 <input 
                    type="text" 
                    value={balance} 
                    onChange={e => setBalance(formatCurrency(e.target.value))} 
                    placeholder="Saldo" 
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border-none outline-none font-black text-sm text-emerald-600" 
                 />
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fech.</span>
                  <input 
                      type="number" 
                      min="1" 
                      max="31" 
                      value={closing} 
                      onChange={e => setClosing(e.target.value)} 
                      placeholder="Fech." 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-center pr-12" 
                  />
               </div>
               <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Venc.</span>
                  <input 
                      type="number" 
                      min="1" 
                      max="31" 
                      value={due} 
                      onChange={e => setDue(e.target.value)} 
                      placeholder="Venc." 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-center pr-12" 
                  />
               </div>
             </div>

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
          const spent = 0; 
          const percent = Math.min((spent / card.limit) * 100, 100);
          
          return (
            <div key={card.id} className={`${card.color} aspect-[1.58/1] p-6 rounded-[2rem] text-white shadow-2xl shadow-slate-900/40 relative group overflow-hidden border border-white/10 flex flex-col justify-between`}>
              {/* Reflective Highlight */}
              <div className="absolute -left-12 -top-12 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700 pointer-events-none"></div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  {/* Chip */}
                  <div className="bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 w-10 h-7 rounded shadow-inner flex items-center justify-center opacity-90 border border-amber-200/20 overflow-hidden">
                    <div className="grid grid-cols-2 w-full h-full opacity-30">
                      <div className="border border-amber-900/40"></div>
                      <div className="border border-amber-900/40"></div>
                      <div className="border border-amber-900/40"></div>
                      <div className="border border-amber-900/40"></div>
                    </div>
                  </div>
                  {/* Contactless Icon */}
                  <div className="text-white/40">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor" fillOpacity="0.2"/>
                      <path d="M7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="12" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setEditingId(card.id)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-md border border-white/10">
                    <ICONS.Edit />
                  </button>
                  <button onClick={() => confirmDelete(card.id)} className="p-1.5 bg-white/10 hover:bg-rose-500/20 rounded-lg transition-colors backdrop-blur-md border border-white/10 text-white/50 hover:text-rose-400">
                    <ICONS.Trash />
                  </button>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-4">
                <div className="space-y-0.5">
                  <p className="text-[13px] font-mono tracking-[0.2em] text-white/90">•••• •••• •••• {card.id.slice(-4).toUpperCase()}</p>
                  <div className="flex justify-between items-center">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.1em] text-white/40">{card.name}</h4>
                    <div className="flex items-center -space-x-2.5 opacity-60">
                      <div className="w-6 h-6 rounded-full bg-rose-500"></div>
                      <div className="w-6 h-6 rounded-full bg-amber-500"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
                    <span>Disponível</span>
                    <span>R$ {card.limit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-1000" style={{ width: `${100 - percent}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className="flex flex-col">
                     <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 leading-none mb-1">FECHAMENTO</p>
                     <p className="text-[10px] font-black tracking-tighter">{card.closingDay.toString().padStart(2, '0')}</p>
                   </div>
                   <div className="flex flex-col">
                     <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 leading-none mb-1">VENCIMENTO</p>
                     <p className="text-[10px] font-black tracking-tighter">{card.dueDay.toString().padStart(2, '0')}</p>
                   </div>
                   <div className="h-6 w-[1px] bg-white/20"></div>
                   <div className="flex flex-col">
                     <p className="text-[7px] font-black uppercase tracking-[0.2em] text-indigo-300 leading-none mb-1">SALDO ATUAL</p>
                     <p className="text-[12px] font-black tracking-tighter text-white">
                       R$ {(card.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </p>
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
