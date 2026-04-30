
import React, { useState, useRef, useEffect } from 'react';
import { askFinanzito } from '../services/geminiService';
import { Transaction, Budget } from '../types';

interface FinancialMascotProps {
  score: number;
  lastAction?: 'income' | 'expense' | null;
  transactions: Transaction[];
  budgets: Budget[];
  goals: any[];
  cards: any[];
  vouchers: any[];
}

const FinancialMascot: React.FC<FinancialMascotProps> = ({ score, lastAction, transactions, budgets, goals, cards, vouchers }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'finanzito', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Determina o estado emocional do Finanzito
  let emotion = '😊'; 
  let statusMessage = 'Tudo sob controle!';
  let bgColor = 'bg-indigo-100 dark:bg-indigo-900/30';
  let textColor = 'text-indigo-600 dark:text-indigo-400';

  // Se houve ação recente, ela tem prioridade
  if (lastAction === 'income') {
    emotion = '🤑';
    statusMessage = 'Dinheiro na conta!';
    bgColor = 'bg-emerald-100 dark:bg-emerald-900/30';
    textColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (lastAction === 'expense') {
    emotion = '😰';
    statusMessage = 'Gasto registrado...';
    bgColor = 'bg-rose-100 dark:bg-rose-900/30';
    textColor = 'text-rose-600 dark:text-rose-400';
  } else {
    // Estado basal baseado no score e equilíbrio real
    if (score > 70) {
      emotion = '😎';
      statusMessage = 'Estamos mandando bem!';
      bgColor = 'bg-emerald-50 dark:bg-emerald-900/20';
      textColor = 'text-emerald-500';
    } else if (score < 30) {
      emotion = '🧐';
      statusMessage = 'Vamos revisar as contas?';
      bgColor = 'bg-amber-50 dark:bg-amber-900/20';
      textColor = 'text-amber-600';
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await askFinanzito(userMessage, { transactions, budgets, goals, cards, vouchers });
    
    setMessages(prev => [...prev, { role: 'finanzito', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 md:w-96 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">{emotion}</span>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">Finanzito IA</h3>
                <p className="text-[9px] font-bold opacity-80 uppercase">Seu mestre financeiro</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="h-80 overflow-y-auto p-6 space-y-4 scrollbar-none bg-slate-50/50 dark:bg-slate-950/50"
          >
            {messages.length === 0 && (
              <div className="text-center space-y-2 py-8">
                <span className="text-4xl opacity-20">💬</span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Eu sei tudo sobre suas finanças.<br/>Pode me perguntar qualquer coisa!</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none prose prose-slate dark:prose-invert prose-xs'
                }`}>
                  {msg.role === 'finanzito' ? (
                    <div className="space-y-2">
                      {msg.content.split('\n').map((line, idx) => {
                        // Bold parsing
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={idx}>
                            {parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={pIdx} className="font-black text-indigo-600 dark:text-indigo-400">{part.slice(2, -2)}</strong>;
                              }
                              if (part.trim().startsWith('* ') || part.trim().startsWith('- ')) {
                                return <span key={pIdx} className="flex items-start gap-2 ml-2 mt-1"><span className="text-indigo-500 mt-1">•</span> {part.trim().substring(2)}</span>;
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="relative flex items-center">
              <input 
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte ao Finanzito..."
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl pl-4 pr-12 py-3.5 text-xs font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9-7-9-7V7l7 5-7 5v-2z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bubble / Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-3 px-4 py-2.5 rounded-[2rem] ${bgColor} border border-white/20 backdrop-blur-md shadow-2xl hover:scale-105 transition-all duration-500 active:scale-95`}
      >
        <div className="text-3xl animate-bounce duration-[2000ms] group-hover:scale-110 transition-transform">{emotion}</div>
        {!isOpen && (
          <div className="text-left animate-in fade-in slide-in-from-right-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Finanzito:</p>
            <p className={`text-xs font-black ${textColor} leading-tight`}>{statusMessage}</p>
          </div>
        )}
      </button>
    </div>
  );
};

export default FinancialMascot;
