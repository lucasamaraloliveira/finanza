
import React, { useState, useRef, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { ICONS } from '../constants';
import { ViewType } from '../types';

interface NavbarProps {
  user: User | null;
  setView: (view: ViewType) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setView, isDarkMode, setIsDarkMode }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="flex items-center justify-between py-4 px-6 mb-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-slate-800/50 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">
            Olá, {user?.displayName?.split(' ')[0] || 'Usuário'}!
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Seu radar financeiro está ativo.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all active:scale-95"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-black">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-50 dark:border-slate-800/50">
                <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{user?.displayName}</p>
                <p className="text-[10px] font-bold text-slate-400 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => { setView('categories'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-all uppercase tracking-tighter"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <ICONS.Settings />
                  </div>
                  Ajustes
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all uppercase tracking-tighter"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </div>
                  Sair do Sistema
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
