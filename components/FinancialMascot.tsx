
import React from 'react';

interface FinancialMascotProps {
  score: number;
  lastAction?: 'income' | 'expense' | null;
}

const FinancialMascot: React.FC<FinancialMascotProps> = ({ score, lastAction }) => {
  // Determina o estado emocional do Finanzito
  let emotion = '😊'; // Neutro/Feliz
  let message = 'Tudo sob controle!';
  let bgColor = 'bg-indigo-100 dark:bg-indigo-900/30';
  let textColor = 'text-indigo-600 dark:text-indigo-400';

  if (lastAction === 'income' || score > 80) {
    emotion = '🤑';
    message = 'Estamos prosperando!';
    bgColor = 'bg-emerald-100 dark:bg-emerald-900/30';
    textColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (lastAction === 'expense' || score < 40) {
    emotion = '😰';
    message = 'Cuidado com os gastos...';
    bgColor = 'bg-rose-100 dark:bg-rose-900/30';
    textColor = 'text-rose-600 dark:text-rose-400';
  } else if (score < 60) {
    emotion = '🧐';
    message = 'Poderia estar melhor.';
    bgColor = 'bg-amber-100 dark:bg-amber-900/30';
    textColor = 'text-amber-600 dark:text-amber-400';
  }

  return (
    <div className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] ${bgColor} border border-white/20 backdrop-blur-md transition-all duration-500 animate-in slide-in-from-right-4`}>
      <div className="text-4xl animate-bounce duration-[2000ms]">{emotion}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Finanzito diz:</p>
        <p className={`text-sm font-black ${textColor}`}>{message}</p>
      </div>
    </div>
  );
};

export default FinancialMascot;
