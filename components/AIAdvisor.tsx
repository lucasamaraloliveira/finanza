
import React, { useState } from 'react';
import { Transaction, Budget } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { ICONS } from '../constants';

interface AIAdvisorProps {
  transactions: Transaction[];
  budgets: Budget[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, budgets }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [question, setQuestion] = useState('');

  const handleGetAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(transactions, budgets, question);
    setAdvice(result || "Não foi possível gerar um conselho agora.");
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-slate-900 p-6 rounded-2xl border border-blue-100 dark:border-indigo-800/50 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-400">
        <ICONS.Sparkles />
        <h3 className="text-lg font-bold">Consultor IA Finanza</h3>
      </div>
      
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Baseado nos seus gastos atuais, posso te ajudar a economizar ou responder dúvidas específicas sobre suas finanças.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Pergunte algo como 'Onde posso economizar?'"
          className="flex-1 px-4 py-2 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />
        <button
          onClick={handleGetAdvice}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-slate-700 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : 'Analisar'}
        </button>
      </div>

      {advice && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-blue-100 dark:border-slate-800 shadow-sm prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-line animate-in fade-in slide-in-from-top-4 duration-500">
          {advice}
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
