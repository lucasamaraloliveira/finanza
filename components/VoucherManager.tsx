
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

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
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
          <div key={v.id} className={`${v.color} p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/10 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
              <span className="text-6xl font-black">{v.type}</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">{v.type === 'VA' ? 'Vale Alimentação' : 'Vale Refeição'}</h4>
              <p className="text-xl font-black mb-10">{v.name}</p>
              
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Saldo Atual</p>
                <p className="text-3xl font-black">R$ {v.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
