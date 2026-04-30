
import React, { useState } from 'react';
import { Voucher, VoucherTransaction } from '../types';
import { ICONS } from '../constants';
import { handleCurrencyInputChange, parseCurrencyBRL, formatCurrencyBRL } from '../utils/format';

interface VoucherManagerProps {
  vouchers: Voucher[];
  transactions: VoucherTransaction[];
  onUpdateVouchers: (v: Voucher[]) => void;
  onUpdateTransactions: (t: VoucherTransaction[]) => void;
}

const VoucherManager: React.FC<VoucherManagerProps> = ({ vouchers, transactions, onUpdateVouchers, onUpdateTransactions }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'VA' | 'VR'>('VA');
  
  // Form para transação
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [transDesc, setTransDesc] = useState('');
  const [transVal, setTransVal] = useState('');
  const [transType, setTransType] = useState<'CREDIT' | 'DEBIT'>('DEBIT');

  const [voucherToDelete, setVoucherToDelete] = useState<string | null>(null);
  const [lastDeletedVoucher, setLastDeletedVoucher] = useState<Voucher | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const addVoucher = () => {
    if (!newName) return;
    const colors = ['bg-orange-500', 'bg-teal-500', 'bg-amber-600', 'bg-emerald-600'];
    const newV: Voucher = {
      id: crypto.randomUUID(),
      name: newName,
      type: newType,
      balance: 0,
      color: colors[vouchers.length % colors.length]
    };
    onUpdateVouchers([...vouchers, newV]);
    setNewName('');
    setIsAdding(false);
  };

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher || !transDesc || !transVal) return;
    
    const amount = parseCurrencyBRL(transVal);
    const newT: VoucherTransaction = {
      id: crypto.randomUUID(),
      voucherId: selectedVoucher,
      description: transDesc,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      type: transType
    };

    onUpdateTransactions([newT, ...transactions]);
    
    // Atualiza o saldo do card
    onUpdateVouchers(vouchers.map(v => {
      if (v.id === selectedVoucher) {
        return {
          ...v,
          balance: transType === 'CREDIT' ? v.balance + amount : v.balance - amount
        };
      }
      return v;
    }));

    setTransDesc('');
    setTransVal('');
    setSelectedVoucher(null);
  };

  const confirmDelete = (id: string) => {
    setVoucherToDelete(id);
  };

  const handleDelete = () => {
    if (!voucherToDelete) return;
    const voucher = vouchers.find(v => v.id === voucherToDelete);
    if (voucher) {
      setLastDeletedVoucher(voucher);
      onUpdateVouchers(vouchers.filter(v => v.id !== voucherToDelete));
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 5000);
    }
    setVoucherToDelete(null);
  };

  const handleUndo = () => {
    if (lastDeletedVoucher) {
      onUpdateVouchers([...vouchers, lastDeletedVoucher]);
      setLastDeletedVoucher(null);
      setShowUndo(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Undo Toast */}
      {showUndo && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Benefício Excluído</p>
              <p className="text-sm font-bold">{lastDeletedVoucher?.name}</p>
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
      {voucherToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setVoucherToDelete(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ICONS.Trash />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Excluir Benefício?</h3>
                <p className="text-slate-500 text-sm">Deseja remover o cartão <b>{vouchers.find(v => v.id === voucherToDelete)?.name}</b>? O saldo de R$ {vouchers.find(v => v.id === voucherToDelete)?.balance.toLocaleString()} será perdido.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setVoucherToDelete(null)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-xs transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-6 py-4 rounded-2xl bg-rose-600 text-white font-black uppercase text-xs hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Gestão de Benefícios</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Controle separado de VA e VR para sua família</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <ICONS.Plus /> Novo Cartão
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-indigo-500/30 shadow-xl max-w-md mx-auto space-y-4">
          <h3 className="text-lg font-black uppercase tracking-widest text-indigo-600">Configurar Benefício</h3>
          <input 
            type="text" value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Nome (Ex: Sodexo, Alelo...)"
            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold"
          />
          <div className="flex gap-2">
            <button onClick={() => setNewType('VA')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${newType === 'VA' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>Alimentação (VA)</button>
            <button onClick={() => setNewType('VR')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${newType === 'VR' ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>Refeição (VR)</button>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setIsAdding(false)} className="flex-1 text-[10px] font-black uppercase text-slate-400">Cancelar</button>
            <button onClick={addVoucher} className="flex-2 bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-[10px]">Confirmar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vouchers.map(v => (
          <div key={v.id} className={`${v.color} aspect-[1.58/1] p-6 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/10 relative overflow-hidden group border border-white/10 flex flex-col justify-between`}>
            {/* Reflective Highlight */}
            <div className="absolute -left-12 -top-12 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="bg-gradient-to-br from-slate-200 to-slate-400 w-10 h-8 rounded-md shadow-inner flex flex-col justify-around py-1 px-1 opacity-80 border border-white/30">
                  <div className="h-[1px] w-full bg-slate-800/20"></div>
                  <div className="h-[1px] w-full bg-slate-800/20"></div>
                  <div className="h-[1px] w-full bg-slate-800/20"></div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => { setSelectedVoucher(v.id); setTransType('CREDIT'); setTransDesc('Aporte de Saldo'); }}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                   >
                     <ICONS.Plus />
                   </button>
                   <button 
                    onClick={() => confirmDelete(v.id)}
                    className="p-1.5 bg-white/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-white/10 text-white/50 hover:text-rose-400"
                   >
                     <ICONS.Trash />
                   </button>
                   <span className="text-2xl font-black italic tracking-tighter opacity-80 ml-1">{v.type}</span>
                </div>
              </div>

              <div className="mt-8 mb-10 space-y-2">
                <div className="flex justify-between items-end">
                   <p className="text-sm font-mono tracking-[0.2em] text-white/90">•••• {v.id.slice(-4).toUpperCase()}</p>
                   <div className="text-right">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1">Instituição</h4>
                     <p className="text-base font-black tracking-tighter leading-none">{v.name}</p>
                   </div>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Saldo Disponível</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-black opacity-60">R$</span>
                  <p className="text-3xl font-black tracking-tighter">
                    {v.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-8">
                <button 
                  onClick={() => { setSelectedVoucher(v.id); setTransType('DEBIT'); }}
                  className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md py-3 rounded-xl text-[10px] font-black uppercase transition-all border border-white/10"
                >
                  Gastar
                </button>
                <button 
                  onClick={() => { setSelectedVoucher(v.id); setTransType('CREDIT'); }}
                  className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md py-3 rounded-xl text-[10px] font-black uppercase transition-all border border-white/5"
                >
                  Recarregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedVoucher && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={addTransaction} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md space-y-6">
            <div className="flex justify-between items-center">
               <h3 className={`text-xl font-black uppercase tracking-tight ${transType === 'CREDIT' ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {transType === 'CREDIT' ? 'Recarga de Benefício' : 'Lançar Gasto VA/VR'}
               </h3>
               <button type="button" onClick={() => setSelectedVoucher(null)} className="text-slate-400 hover:text-slate-600"><ICONS.Close /></button>
            </div>
            
            <div className="space-y-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                 <input 
                  type="text" value={transDesc} onChange={e => setTransDesc(e.target.value)}
                  placeholder="Ex: Almoço, Compras mês..."
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold"
                  required
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor R$</label>
                 <input 
                  type="text" value={transVal} onChange={e => setTransVal(handleCurrencyInputChange(e.target.value))}
                  placeholder="0,00"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-black text-lg"
                  required
                 />
               </div>
            </div>

            <button type="submit" className={`w-full py-4 rounded-2xl font-black uppercase text-white shadow-xl transition-all active:scale-95 ${transType === 'CREDIT' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
              Confirmar Lançamento
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Histórico de Benefícios</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Cartão</th>
                <th className="px-8 py-5">Descrição</th>
                <th className="px-8 py-5 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map(t => {
                const v = vouchers.find(x => x.id === t.voucherId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-5 text-xs text-slate-400 font-medium">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-8 py-5">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-300">
                        {v?.name || 'Excluído'}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-700 dark:text-slate-200">{t.description}</td>
                    <td className={`px-8 py-5 text-right font-black ${t.type === 'CREDIT' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.type === 'CREDIT' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 font-medium italic">Nenhum uso de benefício registrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VoucherManager;
