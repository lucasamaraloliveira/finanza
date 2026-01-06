
import React from 'react';
import { ICONS } from '../constants';
import { ViewType } from '../types';

interface SidebarProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  view, 
  setView, 
  isOpen, 
  setIsOpen, 
  isCollapsed, 
  setIsCollapsed, 
  isDarkMode, 
  setIsDarkMode 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <ICONS.Dashboard /> },
    { id: 'transactions', label: 'Transações', icon: <ICONS.History /> },
    { id: 'annual_comparison', label: 'Comparativo', icon: <ICONS.Budgets /> },
    { id: 'budgets', label: 'Orçamentos', icon: <ICONS.Budgets /> },
    { id: 'categories', label: 'Categorias', icon: <ICONS.Settings /> },
    { id: 'cards', label: 'Cartões', icon: <ICONS.Cards /> },
    { id: 'vouchers', label: 'Benefícios', icon: <ICONS.Plus /> },
    { id: 'goals', label: 'Metas e Invest.', icon: <ICONS.Goals /> },
    { id: 'recurring', label: 'Recorrência', icon: <ICONS.History /> },
    { id: 'calendar', label: 'Calendário', icon: <ICONS.Calendar /> },
    { id: 'scanner', label: 'Scanner IA', icon: <ICONS.Scanner /> },
  ] as const;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-950/20 backdrop-blur-md z-40 transition-opacity duration-500 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`
        fixed z-50 
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        flex flex-col
        lg:top-6 lg:left-6 lg:bottom-6
        inset-y-0 left-0 
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        ${isOpen ? 'translate-x-0 opacity-100 w-64' : '-translate-x-full lg:translate-x-0'}
        bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl
        border border-white/40 dark:border-slate-800/50
        lg:rounded-[2.5rem] shadow-2xl shadow-indigo-500/10
      `}>
        {/* Toggle Button Desktop */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 
            rounded-full items-center justify-center text-slate-400 hover:text-indigo-600 transition-all z-50
            ${isCollapsed ? 'rotate-180' : ''}
          `}
        >
          <ICONS.ChevronLeft />
        </button>

        <div className={`p-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all`}>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-2xl text-white font-bold text-xl shadow-lg shadow-indigo-500/30 flex-shrink-0">F</div>
            {!isCollapsed && (
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-violet-600 tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
                Finanza
              </h1>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ICONS.Close />
            </button>
          )}
        </div>

        <nav className={`flex-1 overflow-y-auto py-2 ${isCollapsed ? 'px-2' : 'px-5'} space-y-1.5 scrollbar-none transition-all`}>
          {!isCollapsed && (
            <p className="px-4 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-4 opacity-70 animate-in fade-in duration-300">Navegação</p>
          )}
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setView(item.id); setIsOpen(false); }}
              title={isCollapsed ? item.label : ''}
              className={`
                w-full flex items-center transition-all duration-300 group relative
                ${isCollapsed ? 'justify-center py-4 px-0 rounded-2xl' : 'gap-3 px-4 py-3.5 rounded-2xl'}
                ${view === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-300'
                }
              `}
            >
              <span className={`transition-transform duration-300 ${view === item.id ? 'scale-110' : 'group-hover:scale-110'} flex-shrink-0`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-sm font-bold whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-300">
                  {item.label}
                </span>
              )}
              {isCollapsed && view === item.id && (
                <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        <div className={`p-6 mt-auto transition-all ${isCollapsed ? 'px-2' : 'px-6'}`}>
          <div className={`bg-slate-100/50 dark:bg-slate-800/40 p-2 rounded-[2rem] border border-white/20 dark:border-slate-700/30 transition-all ${isCollapsed ? 'rounded-2xl' : ''}`}>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`
                w-full flex items-center justify-center gap-2 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800 shadow-sm transition-all active:scale-95
                ${isCollapsed ? 'p-3 rounded-xl' : 'px-4 py-3'}
              `}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
              {!isCollapsed && <span className="animate-in fade-in duration-300">{isDarkMode ? 'Light' : 'Dark'}</span>}
            </button>
          </div>
          {!isCollapsed && (
            <div className="mt-4 px-4 flex items-center justify-between animate-in fade-in duration-300">
              <span className="text-[10px] font-bold text-slate-400 tracking-tighter">Finanza v2.5</span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
