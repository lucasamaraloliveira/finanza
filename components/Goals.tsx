
import React, { useState, useEffect } from 'react';
import { SavingsGoal } from '../types';
import { ICONS } from '../constants';
import { handleCurrencyInputChange, parseCurrencyBRL, formatCurrencyBRL } from '../utils/format';

interface GoalsProps {
  goals: SavingsGoal[];
  onSave: (goals: SavingsGoal[]) => void;
}

const Goals: React.FC<GoalsProps> = ({ goals, onSave }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isInvesting, setIsInvesting] = useState<string | null>(null);
  const [investValue, setInvestValue] = useState('');
  
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [lastDeletedGoal, setLastDeletedGoal] = useState<SavingsGoal | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  useEffect(() => {
    if (editingId) {
      const goal = goals.find(g => g.id === editingId);
      if (goal) {
        setName(goal.name);
        setTarget(formatCurrencyBRL(goal.targetAmount));
      }
    } else {
      setName('');
      setTarget('');
    }
  }, [editingId, goals]);

  const handleSaveGoal = () => {
    if (!name || !target) return;
    
    const numericTarget = parseCurrencyBRL(target);

    if (editingId) {
      onSave(goals.map(g => g.id === editingId ? {
        ...g,
        name,
        targetAmount: numericTarget
      } : g));
      setEditingId(null);
    } else {
      const newGoal: SavingsGoal = {
        id: crypto.randomUUID(),
        name,
        targetAmount: numericTarget,
        currentAmount: 0,
        icon: name.toLowerCase().includes('viagem') ? '✈️' : 
              name.toLowerCase().includes('casa') ? '🏠' : 
              name.toLowerCase().includes('carro') ? '🚗' : 
              name.toLowerCase().includes('reserva') ? '🛡️' : '📈'
      };
      onSave([...goals, newGoal]);
    }
    setName('');
    setTarget('');
  };

  const handleInvest = (id: string) => {
    const val = parseCurrencyBRL(investValue);
    if (isNaN(val) || val <= 0) return;

    onSave(goals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + val } : g));
    setInvestValue('');
    setIsInvesting(null);
  };

  const confirmDelete = (id: string) => {
    setGoalToDelete(id);
  };

  const handleDelete = () => {
    if (!goalToDelete) return;
    const goal = goals.find(g => g.id === goalToDelete);
    if (goal) {
      setLastDeletedGoal(goal);
      onSave(goals.filter(g => g.id !== goalToDelete));
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 5000);
    }
    setGoalToDelete(null);
  };

  const handleUndo = () => {
    if (lastDeletedGoal) {
      onSave([...goals, lastDeletedGoal]);
      setLastDeletedGoal(null);
      setShowUndo(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Undo Toast */}
      {showUndo && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Objetivo Removido</p>
              <p className="text-sm font-bold">{lastDeletedGoal?.name}</p>
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
      {goalToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setGoalToDelete(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ICONS.Trash />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Excluir Meta?</h3>
                <p className="text-slate-500 text-sm">Tem certeza que deseja remover o objetivo <b>{goals.find(g => g.id === goalToDelete)?.name}</b>? O progresso acumulado de R$ {goals.find(g => g.id === goalToDelete)?.currentAmount.toLocaleString()} será perdido.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setGoalToDelete(null)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-6 py-4 rounded-2xl bg-rose-600 text-white font-black uppercase text-xs hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all"
                >
                  Excluir Meta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-[2.5rem] text-white flex flex-col justify-center gap-4 shadow-2xl shadow-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 bg-indigo-500 rounded-lg text-white">
              <ICONS.Goals />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter">
              {editingId ? 'Ajustar Plano' : 'Nova Meta'}
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-indigo-300 uppercase tracking-widest ml-1">Nome do Objetivo</label>
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Ex: Reserva de Emergência"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:bg-white/10 focus:border-indigo-500 transition-all font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-indigo-300 uppercase tracking-widest ml-1">Valor Alvo (R$)</label>
              <input 
                type="text" value={target} onChange={e => setTarget(handleCurrencyInputChange(e.target.value))}
                placeholder="0,00"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:bg-white/10 focus:border-indigo-500 transition-all font-black text-base"
              />
            </div>
            
            <div className="flex gap-2 pt-1">
              {editingId && (
                <button 
                  onClick={() => setEditingId(null)}
                  className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all"
                >
                  Sair
                </button>
              )}
              <button 
                onClick={handleSaveGoal}
                className="flex-[2] bg-indigo-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                {editingId ? 'Atualizar' : 'Criar Plano'}
              </button>
            </div>
          </div>
        </div>

        {goals.map(goal => {
          const percent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
          const isSelected = isInvesting === goal.id;

          return (
            <div key={goal.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden group transition-all hover:shadow-xl">
              <div className="absolute top-5 right-5 flex gap-2">
                <button 
                  onClick={() => setEditingId(goal.id)}
                  className="text-slate-300 hover:text-indigo-500 transition-colors p-1"
                >
                  <ICONS.Edit />
                </button>
                <button 
                  onClick={() => confirmDelete(goal.id)}
                  className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                >
                  <ICONS.Trash />
                </button>
              </div>
              
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500">{goal.icon}</div>
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-1">{goal.name}</h4>
              
              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Acumulado</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              
              <div className="w-full space-y-2 mb-8">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className={percent >= 100 ? 'text-emerald-500' : 'text-indigo-600'}>{percent}% Concluído</span>
                  <span className="text-slate-400">Meta: R$ {goal.targetAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 shadow-sm ${percent >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-indigo-500 to-violet-600'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {isSelected ? (
                <div className="w-full space-y-3 animate-in slide-in-from-bottom-2">
                  <input 
                    type="text" autoFocus
                    value={investValue} onChange={e => setInvestValue(handleCurrencyInputChange(e.target.value))}
                    placeholder="Quanto investir?"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-indigo-500 outline-none font-black text-center"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setIsInvesting(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 py-3 rounded-xl font-black uppercase text-[10px]">Cancelar</button>
                    <button onClick={() => handleInvest(goal.id)} className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-black uppercase text-[10px]">Confirmar</button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsInvesting(goal.id)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-indigo-500/10"
                >
                  <ICONS.Plus /> Adicionar Valor
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;
